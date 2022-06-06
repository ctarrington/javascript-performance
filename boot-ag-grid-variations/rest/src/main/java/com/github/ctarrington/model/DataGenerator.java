package com.github.ctarrington.model;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class DataGenerator {

    private static final List<String> colors = Arrays.asList("Red", "Blue", "Green", "Brown", "Orange");
    private static List<Column> makeDefinitions() {
        List<Column> definitions = new ArrayList<>();
        definitions.add(new IDColumn("ID", "number"));
        definitions.add(new ListBasedColumn("Hair Color", "string", colors, 2));
        definitions.add(new ListBasedColumn("Eye Color", "string", colors, 0));
        definitions.add(new NoisyNumericColumn("Weight", "number", 100));

        return definitions;
    }

    private static final List<Column> definitions = makeDefinitions();

    public static List<Row> getRows(int tick, int rowCount) {
        List<Row> rows = new ArrayList<>();

        for (int index=0; index<rowCount; index++) {
            Row row = new Row();
            for (Column definition : definitions) {
                row.addValue(definition.getValue(tick, index));
            }
            rows.add(row);
        }

        return rows;
    }

    public static List<Column> getDefinitions() {
        return definitions;
    }
}
