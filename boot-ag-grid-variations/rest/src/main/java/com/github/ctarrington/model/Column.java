package com.github.ctarrington.model;

public abstract class Column {
    private final String name;
    private final String type;

    public Column(String name, String type) {
        this.name = name;
        this.type = type;
    }

    public String getName() {
        return this.name;
    }

    public String getType() {
        return this.type;
    }

    abstract String getValue(int tick, int row);
}
