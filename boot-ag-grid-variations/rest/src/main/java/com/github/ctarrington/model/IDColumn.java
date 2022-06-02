package com.github.ctarrington.model;

public class IDColumn extends Column {
    public IDColumn(String name, String type) {
        super(name, type);
    }

    @Override
    String getValue(int tick, int row) {
        return ""+row;
    }
}
