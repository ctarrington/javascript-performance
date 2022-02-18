class Field {
  value: number = 0;
  name: string = "";
}

export class FieldCriteria {
  minimum: number | null = null;
  maximum: number | null = null;
}

export class Alien {
  id: number = 0;
  fields: Field[] = [];
}
