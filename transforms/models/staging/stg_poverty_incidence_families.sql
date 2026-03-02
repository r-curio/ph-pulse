with source as (

    select * from {{ source('ph_pulse', 'raw_poverty_incidence_families') }}

),

cleaned as (

    select
        -- parse hierarchy from leading dots
        length(geolocation) - length(ltrim(geolocation, '.')) as dot_count,
        case
            when length(geolocation) - length(ltrim(geolocation, '.')) = 0
                then 'national'
            when length(geolocation) - length(ltrim(geolocation, '.')) = 2
                then 'region'
            else 'province'
        end as geo_level,
        trim(geolocation, '.') as geo_name,

        -- 2018 metrics
        safe_cast(nullif(poverty_threshold_php_2018, '..') as float64)
            as poverty_threshold_php_2018,
        safe_cast(nullif(poverty_incidence_pct_2018, '..') as float64)
            as poverty_incidence_pct_2018,
        safe_cast(nullif(coefficient_of_variation_2018, '..') as float64)
            as coefficient_of_variation_2018,
        safe_cast(nullif(standard_error_2018, '..') as float64)
            as standard_error_2018,
        safe_cast(nullif(ci_lower_2018, '..') as float64) as ci_lower_2018,
        safe_cast(nullif(ci_upper_2018, '..') as float64) as ci_upper_2018,

        -- 2021 metrics
        safe_cast(nullif(poverty_threshold_php_2021, '..') as float64)
            as poverty_threshold_php_2021,
        safe_cast(nullif(poverty_incidence_pct_2021, '..') as float64)
            as poverty_incidence_pct_2021,
        safe_cast(nullif(coefficient_of_variation_2021, '..') as float64)
            as coefficient_of_variation_2021,
        safe_cast(nullif(standard_error_2021, '..') as float64)
            as standard_error_2021,
        safe_cast(nullif(ci_lower_2021, '..') as float64) as ci_lower_2021,
        safe_cast(nullif(ci_upper_2021, '..') as float64) as ci_upper_2021,

        -- 2023 metrics
        safe_cast(nullif(poverty_threshold_php_2023, '..') as float64)
            as poverty_threshold_php_2023,
        safe_cast(nullif(poverty_incidence_pct_2023, '..') as float64)
            as poverty_incidence_pct_2023,
        safe_cast(nullif(coefficient_of_variation_2023, '..') as float64)
            as coefficient_of_variation_2023,
        safe_cast(nullif(standard_error_2023, '..') as float64)
            as standard_error_2023,
        safe_cast(nullif(ci_lower_2023, '..') as float64) as ci_lower_2023,
        safe_cast(nullif(ci_upper_2023, '..') as float64) as ci_upper_2023

    from source

)

select * from cleaned
