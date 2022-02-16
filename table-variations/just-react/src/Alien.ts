function getRandomInRange(start: number, stop: number) {
  return start + Math.random() * (stop - start);
}

class Field {
  value: number;
  derivative: number;
  name: string;

  constructor(name: string) {
    this.name = name;
    this.value = getRandomInRange(0, 100);
    this.derivative = getRandomInRange(-1.5, 1.5);
  }

  tick() {
    this.value = this.value + this.derivative;
  }
}

export class Alien {
  id: number;
  fields: Field[] = [new Field("height"), new Field("weight")];

  constructor(id: number) {
    this.id = id;
  }

  tick() {
    for (let field of this.fields) {
      field.tick();
    }
  }
}
