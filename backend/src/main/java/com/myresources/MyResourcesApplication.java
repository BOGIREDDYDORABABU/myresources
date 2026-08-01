package com.myresources;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class MyResourcesApplication {
    public static void main(String[] args) {
        SpringApplication.run(MyResourcesApplication.class, args);
    }
}
