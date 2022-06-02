package com.github.ctarrington.model;

import java.util.List;

public class NoisyNumericColumn extends Column {

    private final float centralValue;

    public NoisyNumericColumn(String name, String type, float centralValue) {
        super(name, type);
        this.centralValue = centralValue;
    }

    String getValue(int tick, int row) {
        final float numericValue = (float) (centralValue + Math.random()-0.5);
        return ""+numericValue;
    }
}
