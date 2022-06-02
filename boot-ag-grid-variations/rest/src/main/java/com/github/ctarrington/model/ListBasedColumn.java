package com.github.ctarrington.model;

import java.util.List;

public class ListBasedColumn extends Column {
    private final List<String> values;
    private final int offset;

    public ListBasedColumn(String name, String type, List<String> values, int offset) {
        super(name, type);
        this.values = values;
        this.offset = offset;
    }

    String getValue(int tick, int row) {
        final int index = (offset + row) % values.size();
        return values.get(index);
    }
}
