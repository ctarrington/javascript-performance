package com.github.ctarrington.model;

import org.springframework.core.task.SimpleAsyncTaskExecutor;
import org.springframework.core.task.TaskExecutor;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.IntStream;

public class DataGenerator {

    private static final List<String> colors = Arrays.asList("Red", "Blue", "Green", "Brown", "Orange");
    private static final List<String> sizes = Arrays.asList("Small", "Medium", "Large", "Extra Large");
    private static List<Column> makeDefinitions() {
        List<Column> definitions = new ArrayList<>();
        definitions.add(new IDColumn("ID", "number"));
        definitions.add(new ListBasedColumn("Hair Color", "string", colors, 2));
        definitions.add(new ListBasedColumn("Eye Color", "string", colors, 0));
        definitions.add(new ListBasedColumn("Shirt Size", "string", sizes, 0));
        definitions.add(new ListBasedColumn("Pant Size", "string", sizes, 2));
        definitions.add(new GeneratedNumericColumn("Weight", (Integer tick, Integer row) -> {return 100 + row * 0.04 + Math.random()/10;} ));
        definitions.add(new GeneratedNumericColumn("Height", (Integer tick, Integer row) -> {return 55 + row * 0.03 + Math.random()/10;} ));

        IntStream.range(0, 40).forEach(ctr -> {
            final int startValue = ctr;
            definitions.add(new GeneratedNumericColumn("Value " + ctr, (Integer tick, Integer row) -> {
                return startValue + row * 0.3 + Math.random()/10;
            }));
        });
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
