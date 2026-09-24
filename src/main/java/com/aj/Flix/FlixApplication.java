package com.aj.Flix;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(exclude = {
		org.springframework.ai.vectorstore.pgvector.autoconfigure.PgVectorStoreAutoConfiguration.class
})
public class FlixApplication {

	public static void main(String[] args) {
		SpringApplication.run(FlixApplication.class, args);
	}

}
