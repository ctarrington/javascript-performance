package com.github.ctarrington.model;

import java.text.DecimalFormat;
import java.util.function.ToDoubleBiFunction;

public class GeneratedNumericColumn extends Column {
    private static DecimalFormat FORMAT = new DecimalFormat("0.###");

    private final ToDoubleBiFunction<Integer, Integer> generationOperation;

    public GeneratedNumericColumn(String name, ToDoubleBiFunction<Integer, Integer> generationOperation) {
        super(name, "number");
        this.generationOperation = generationOperation;
    }

    String getValue(int tick, int row) {
        final double numericValue = this.generationOperation.applyAsDouble(tick, row);
        return FORMAT.format(numericValue);
    }
}
