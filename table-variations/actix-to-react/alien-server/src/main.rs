use std::ops::Deref;
use std::sync::Mutex;
use std::time::Duration;
use std::{cmp, thread, time};

use rand::Rng;

use actix_web::web::Data;
use actix_web::{get, web, App, HttpResponse, HttpServer, Responder};

use serde::Serialize;

#[derive(Serialize, Clone)]
struct Field {
    value: f32,
    derivative: f32,
    name: String,
}

impl Field {
    fn new(name: String) -> Self {
        let mut rng = rand::thread_rng();

        Field {
            value: rng.gen_range(-1.5..1.5),
            derivative: rng.gen_range(-0.25..0.25),
            name,
        }
    }

    fn tick(&mut self) {
        self.value = self.value + self.derivative;
    }
}

#[derive(Serialize, Clone)]
struct Alien {
    id: usize,
    fields: Vec<Field>,
}

impl Alien {
    fn new(id: usize, field_count: usize) -> Self {
        let mut fields = vec![];
        for index in 0..field_count {
            fields.push(Field::new(format!("Field {}", index)));
        }

        Alien { id, fields }
    }
}

/// calculated state can have information that is not shared with the UI
struct CalculatedState {
    tick_count: usize,
    aliens: Vec<Alien>,
}

impl CalculatedState {
    fn new() -> Self {
        CalculatedState {
            tick_count: 0,
            aliens: vec![],
        }
    }

    fn tick(&mut self) {
        self.aliens.push(Alien::new(self.tick_count, 10));
        self.tick_count = self.tick_count + 1;
    }
}

/// projection of the calculated state - just the fields that are needed for the UI
/// having this level of indirection does require cloning
#[derive(Serialize)]
struct SharedState {
    tick_count: usize,
    aliens: Vec<Alien>,
}

impl SharedState {
    fn new(calculated_state: &CalculatedState) -> Self {
        SharedState {
            tick_count: calculated_state.tick_count,
            aliens: calculated_state.aliens.clone(),
        }
    }
}

struct WrappedState {
    current: Mutex<SharedState>,
}

#[get("/")]
async fn get_current(data: web::Data<WrappedState>) -> impl Responder {
    // just using the derefed (unpacked) SharedState in the to_string works fine
    // assigning it to a temp variable gives move issues
    let serialized: String = serde_json::to_string(
        data.current
            .lock()
            .expect("unable to lock the data")
            .deref(),
    )
    .expect("unable to serialize the current state");
    HttpResponse::Ok().body(serialized)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let wrapped_state = Data::new(WrappedState {
        current: Mutex::new(SharedState::new(&CalculatedState::new())),
    });

    // copy of pointer for use in the thread
    let wrapped_state_for_thread = wrapped_state.clone();
    thread::spawn(move || {
        let mut calculated_state = CalculatedState::new();
        loop {
            let begin = time::Instant::now();
            calculated_state.tick();

            // grap the lock, swap the shared state, release the lock when current goes out of scope
            {
                let mut current = wrapped_state_for_thread
                    .current
                    .lock()
                    .expect("unable to lock the wrapped_state_for_thread");
                *current = SharedState::new(&calculated_state);
            }

            let elapsed = time::Instant::now() - begin;
            let goal = Duration::from_secs(1);
            let pause: Duration = if elapsed > goal {
                println!(
                    "warning: falling behind in update loop: {:?} > {:?}",
                    elapsed, goal
                );
                Duration::from_secs(0)
            } else {
                goal - elapsed
            };
            println!(
                "back from increment, took {:?}, about to sleep: {:?}",
                elapsed, pause
            );
            thread::sleep(pause);
        }
    });

    println!("listening at http://localhost:8080");
    // move a copy of the reference counted pointer to the shared state
    HttpServer::new(move || {
        App::new()
            .app_data(wrapped_state.clone())
            .service(get_current)
    })
    .bind("127.0.0.1:8080")
    .expect("unable to bind to address")
    .run()
    .await
}
