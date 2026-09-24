package com.aj.Flix.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "credits")
@Getter
@Setter
@NoArgsConstructor
public class Credit {

    @Id
    @Column(name = "id")
    private Integer id;

    @Column(name = "\"cast\"", columnDefinition = "TEXT")
    private String cast;

    @Column(name = "crew", columnDefinition = "TEXT")
    private String crew;
}
