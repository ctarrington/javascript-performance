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
}

export class FieldCriteria {
  minimum: number | null = null;
  maximum: number | null = null;
}

export class Alien {
  id: number;
  fields: Field[];

  constructor(id: number, fieldCount: number) {
    this.id = id;
    this.fields = [];

    for (let index=0; index < fieldCount; index++) {
      this.fields.push(new Field("Field " + index));
    }
  }
}
