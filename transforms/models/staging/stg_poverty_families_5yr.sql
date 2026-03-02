with source as (

    select * from {{ source('ph_pulse', 'raw_poverty_families_5yr') }}

),

cleaned as (

    select
        -- parse hierarchy: both national and regions have 0 dots, provinces have 2
        length(geolocation) - length(ltrim(geolocation, '.')) as dot_count,
        case
            when length(geolocation) - length(ltrim(geolocation, '.')) = 0
                and upper(trim(geolocation)) = 'PHILIPPINES'
                then 'national'
            when length(geolocation) - length(ltrim(geolocation, '.')) = 0
                then 'region'
            else 'province'
        end as geo_level,
        trim(geolocation, '.') as geo_name,

        -- 1991 metrics
        safe_cast(nullif(poverty_threshold_php_1991, '..') as float64)
            as poverty_threshold_php_1991,
        safe_cast(nullif(poverty_incidence_pct_1991, '..') as float64)
            as poverty_incidence_pct_1991,
        safe_cast(nullif(coefficient_of_variation_1991, '..') as float64)
            as coefficient_of_variation_1991,
        safe_cast(nullif(magnitude_poor_families_1991, '..') as float64)
            as magnitude_poor_families_1991,

        -- 2006 metrics
        safe_cast(nullif(poverty_threshold_php_2006, '..') as float64)
            as poverty_threshold_php_2006,
        safe_cast(nullif(poverty_incidence_pct_2006, '..') as float64)
            as poverty_incidence_pct_2006,
        safe_cast(nullif(coefficient_of_variation_2006, '..') as float64)
            as coefficient_of_variation_2006,
        safe_cast(nullif(magnitude_poor_families_2006, '..') as float64)
            as magnitude_poor_families_2006,

        -- 2009 metrics
        safe_cast(nullif(poverty_threshold_php_2009, '..') as float64)
            as poverty_threshold_php_2009,
        safe_cast(nullif(poverty_incidence_pct_2009, '..') as float64)
            as poverty_incidence_pct_2009,
        safe_cast(nullif(coefficient_of_variation_2009, '..') as float64)
            as coefficient_of_variation_2009,
        safe_cast(nullif(magnitude_poor_families_2009, '..') as float64)
            as magnitude_poor_families_2009,

        -- 2012 metrics
        safe_cast(nullif(poverty_threshold_php_2012, '..') as float64)
            as poverty_threshold_php_2012,
        safe_cast(nullif(poverty_incidence_pct_2012, '..') as float64)
            as poverty_incidence_pct_2012,
        safe_cast(nullif(coefficient_of_variation_2012, '..') as float64)
            as coefficient_of_variation_2012,
        safe_cast(nullif(magnitude_poor_families_2012, '..') as float64)
            as magnitude_poor_families_2012,

        -- 2015 metrics
        safe_cast(nullif(poverty_threshold_php_2015, '..') as float64)
            as poverty_threshold_php_2015,
        safe_cast(nullif(poverty_incidence_pct_2015, '..') as float64)
            as poverty_incidence_pct_2015,
        safe_cast(nullif(coefficient_of_variation_2015, '..') as float64)
            as coefficient_of_variation_2015,
        safe_cast(nullif(magnitude_poor_families_2015, '..') as float64)
            as magnitude_poor_families_2015

    from source

)

select * from cleaned
