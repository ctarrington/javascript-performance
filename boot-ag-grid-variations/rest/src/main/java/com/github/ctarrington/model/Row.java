package com.github.ctarrington.model;

import java.util.ArrayList;
import java.util.List;

public class Row {
    private final List<String> values = new ArrayList<>();

    public void addValue(String value) {
        this.values.add(value);
    }

    public List<String> getValues() {
        return this.values;
    }

}
