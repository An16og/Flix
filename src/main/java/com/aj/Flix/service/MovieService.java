package com.aj.Flix.service;

import com.aj.Flix.dto.CastMemberDto;
import com.aj.Flix.dto.MovieCardDto;
import com.aj.Flix.dto.MovieDetailDto;
import com.aj.Flix.entity.Credit;
import com.aj.Flix.entity.Keyword;
import com.aj.Flix.entity.Movie;
import com.aj.Flix.repository.CreditRepository;
import com.aj.Flix.repository.KeywordRepository;
import com.aj.Flix.repository.MovieRepository;
import com.fasterxml.jackson.core.json.JsonReadFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MovieService {

    private final MovieRepository movieRepository;
    private final CreditRepository creditRepository;
    private final KeywordRepository keywordRepository;

    // Parser configured to accept Kaggle's single-quoted Python dict-like JSON strings
    private final ObjectMapper lenientMapper = JsonMapper.builder()
            .enable(JsonReadFeature.ALLOW_SINGLE_QUOTES)
            .enable(JsonReadFeature.ALLOW_UNQUOTED_FIELD_NAMES)
            .build();

    public Page<MovieCardDto> browseMovies(int page, int size, String genre, String search, String sortBy) {
        Sort sort = Sort.by(Sort.Direction.DESC, "popularity");
        if ("rating".equalsIgnoreCase(sortBy) || "vote_average".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "voteAverage");
        } else if ("release_date".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "releaseDate");
        }

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Movie> moviePage;

        boolean hasSearch = search != null && !search.isBlank();
        boolean hasGenre = genre != null && !genre.isBlank();

        if (hasSearch && hasGenre) {
            moviePage = movieRepository.findByTitleContainingIgnoreCaseAndGenresContainingIgnoreCase(
                    search.trim(), genre.trim(), pageable);
        } else if (hasSearch) {
            moviePage = movieRepository.findByTitleContainingIgnoreCase(search.trim(), pageable);
        } else if (hasGenre) {
            moviePage = movieRepository.findByGenresContainingIgnoreCase(genre.trim(), pageable);
        } else {
            moviePage = movieRepository.findAll(pageable);
        }

        return moviePage.map(this::toCardDto);
    }

    public MovieDetailDto getMovieDetail(Integer movieId) {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new IllegalArgumentException("Movie not found with id: " + movieId));

        List<CastMemberDto> topCast = new ArrayList<>();
        List<String> directors = new ArrayList<>();

        creditRepository.findById(movieId).ifPresent(credit -> {
            parseCast(credit.getCast(), topCast);
            parseDirectors(credit.getCrew(), directors);
        });

        List<String> keywords = new ArrayList<>();
        keywordRepository.findById(movieId).ifPresent(kw -> parseKeywords(kw.getKeywords(), keywords));

        return MovieDetailDto.builder()
                .id(movie.getId())
                .title(movie.getTitle())
                .tagline(movie.getTagline())
                .overview(movie.getOverview())
                .posterPath(movie.getPosterPath())
                .posterUrl(buildPosterUrl(movie.getPosterPath()))
                .imdbId(movie.getImdbId())
                .imdbUrl(buildImdbUrl(movie.getImdbId()))
                .voteAverage(movie.getVoteAverage())
                .voteCount(movie.getVoteCount())
                .popularity(movie.getPopularity())
                .releaseDate(movie.getReleaseDate())
                .runtime(movie.getRuntime())
                .genres(parseNames(movie.getGenres()))
                .topCast(topCast)
                .directors(directors)
                .keywords(keywords)
                .hasEmbedding(movie.getEmbedding() != null)
                .build();
    }

    public MovieCardDto toCardDto(Movie movie) {
        return MovieCardDto.builder()
                .id(movie.getId())
                .title(movie.getTitle())
                .posterPath(movie.getPosterPath())
                .posterUrl(buildPosterUrl(movie.getPosterPath()))
                .voteAverage(movie.getVoteAverage())
                .voteCount(movie.getVoteCount())
                .popularity(movie.getPopularity())
                .releaseDate(movie.getReleaseDate())
                .genres(parseNames(movie.getGenres()))
                .build();
    }

    public List<MovieCardDto> getTrendingMovies(int limit) {
        return movieRepository.findPopularMovies(50, PageRequest.of(0, limit))
                .getContent().stream()
                .map(this::toCardDto)
                .toList();
    }

    public List<MovieCardDto> getTopRatedMovies(int limit) {
        return movieRepository.findTopRatedMovies(200, PageRequest.of(0, limit))
                .getContent().stream()
                .map(this::toCardDto)
                .toList();
    }

    public List<String> getAllGenres() {
        return List.of(
                "Action", "Adventure", "Animation", "Comedy", "Crime",
                "Documentary", "Drama", "Family", "Fantasy", "History",
                "Horror", "Music", "Mystery", "Romance", "Science Fiction",
                "Thriller", "War", "Western"
        );
    }

    public static String buildPosterUrl(String posterPath) {
        if (posterPath == null || posterPath.isBlank()) {
            return "https://placehold.co/500x750/1e293b/ffffff?text=No+Poster";
        }
        if (posterPath.startsWith("http://") || posterPath.startsWith("https://")) {
            return posterPath;
        }
        return "https://image.tmdb.org/t/p/w500" + (posterPath.startsWith("/") ? posterPath : "/" + posterPath);
    }

    public static String buildProfileUrl(String profilePath) {
        if (profilePath == null || profilePath.isBlank()) {
            return "https://placehold.co/185x278/1e293b/ffffff?text=No+Photo";
        }
        if (profilePath.startsWith("http://") || profilePath.startsWith("https://")) {
            return profilePath;
        }
        return "https://image.tmdb.org/t/p/w185" + (profilePath.startsWith("/") ? profilePath : "/" + profilePath);
    }

    public static String buildImdbUrl(String imdbId) {
        if (imdbId == null || imdbId.isBlank()) return null;
        return "https://www.imdb.com/title/" + imdbId.trim();
    }

    public List<String> parseNames(String jsonString) {
        if (jsonString == null || jsonString.isBlank()) return Collections.emptyList();
        List<String> names = new ArrayList<>();
        try {
            JsonNode root = lenientMapper.readTree(jsonString);
            if (root.isArray()) {
                for (JsonNode item : root) {
                    if (item.has("name")) {
                        names.add(item.get("name").asText());
                    }
                }
            }
        } catch (Exception ignored) {}
        return names;
    }

    private void parseCast(String castJson, List<CastMemberDto> castList) {
        if (castJson == null || castJson.isBlank()) return;
        try {
            JsonNode root = lenientMapper.readTree(castJson);
            if (root.isArray()) {
                int count = 0;
                for (JsonNode node : root) {
                    if (count++ >= 8) break; // Top 8 cast members
                    String name = node.path("name").asText("");
                    String character = node.path("character").asText("");
                    String profile = node.path("profile_path").asText(null);
                    castList.add(new CastMemberDto(name, character, profile, buildProfileUrl(profile)));
                }
            }
        } catch (Exception ignored) {}
    }

    private void parseDirectors(String crewJson, List<String> directors) {
        if (crewJson == null || crewJson.isBlank()) return;
        try {
            JsonNode root = lenientMapper.readTree(crewJson);
            if (root.isArray()) {
                for (JsonNode node : root) {
                    if ("Director".equalsIgnoreCase(node.path("job").asText())) {
                        directors.add(node.path("name").asText());
                    }
                }
            }
        } catch (Exception ignored) {}
    }

    private void parseKeywords(String keywordsJson, List<String> keywords) {
        if (keywordsJson == null || keywordsJson.isBlank()) return;
        try {
            JsonNode root = lenientMapper.readTree(keywordsJson);
            if (root.isArray()) {
                int count = 0;
                for (JsonNode node : root) {
                    if (count++ >= 15) break;
                    keywords.add(node.path("name").asText());
                }
            }
        } catch (Exception ignored) {}
    }
}
