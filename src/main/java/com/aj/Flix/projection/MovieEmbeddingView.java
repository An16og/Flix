package com.aj.Flix.projection;

/**
 * JPA Projection for the embedding pipeline ETL process.
 *
 * Only loads the text columns needed to build the embedding input string,
 * keeping large TEXT fields out of any search/write-back operations.
 * Mapped by Spring Data JPA via interface-based closed projection.
 */
public interface MovieEmbeddingView {

    Integer getId();

    String getTitle();

    String getOverview();

    String getTagline();

    String getGenres();
}
