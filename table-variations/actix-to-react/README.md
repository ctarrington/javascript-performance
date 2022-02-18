## run
cd alien-server    
find . -name "*.rs" | entr -r -c cargo run --release    

cd alien-client    
npm start    
