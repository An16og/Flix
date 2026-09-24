package com.aj.Flix.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "keywords")
@Getter
@Setter
@NoArgsConstructor
public class Keyword {

    @Id
    @Column(name = "id")
    private Integer id;

    @Column(name = "keywords", columnDefinition = "TEXT")
    private String keywords;
}
