package com.github.ctarrington.rest;

import com.github.ctarrington.model.DataGenerator;
import com.github.ctarrington.model.Row;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.github.ctarrington.model.Column;

import java.util.List;

@SpringBootApplication
@RestController
public class RestApplication {
    private static int tick = 0;

    public static void main(String[] args) {
        SpringApplication.run(RestApplication.class, args);
    }

    @GetMapping("/columns")
    public List<Column> columns() {
        return DataGenerator.getDefinitions();
    }

    @GetMapping("/values")
    public List<Row> rows() {
        tick++;
        return DataGenerator.getRows(tick, tick);
    }
}
