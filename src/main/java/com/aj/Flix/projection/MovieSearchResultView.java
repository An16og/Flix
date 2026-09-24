package com.aj.Flix.projection;

/**
 * JPA Projection for frontend search results.
 *
 * Returns only the lightweight fields the UI needs — avoids pulling large
 * overview/tagline TEXT columns across the wire for every search hit.
 *
 * NOTE: When used with a native @Query, Spring Data JPA matches the SQL column
 * aliases (e.g. "poster_path as posterPath") to the getter names here.
 */
public interface MovieSearchResultView {

    Integer getId();

    String getTitle();

    String getPosterPath();

    Double getVoteAverage();

    Integer getVoteCount();

    Double getPopularity();

    Double getSimilarityScore();
}
