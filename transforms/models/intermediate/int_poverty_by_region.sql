with staged as (

    select * from {{ ref('stg_poverty_incidence_families') }}
    where geo_level in ('national', 'region')

),

unpivoted as (

    select
        geo_level,
        geo_name,
        2018 as year,
        poverty_threshold_php_2018 as poverty_threshold_php,
        poverty_incidence_pct_2018 as poverty_incidence_pct,
        coefficient_of_variation_2018 as coefficient_of_variation,
        standard_error_2018 as standard_error,
        ci_lower_2018 as ci_lower,
        ci_upper_2018 as ci_upper
    from staged

    union all

    select
        geo_level,
        geo_name,
        2021 as year,
        poverty_threshold_php_2021,
        poverty_incidence_pct_2021,
        coefficient_of_variation_2021,
        standard_error_2021,
        ci_lower_2021,
        ci_upper_2021
    from staged

    union all

    select
        geo_level,
        geo_name,
        2023 as year,
        poverty_threshold_php_2023,
        poverty_incidence_pct_2023,
        coefficient_of_variation_2023,
        standard_error_2023,
        ci_lower_2023,
        ci_upper_2023
    from staged

)

select * from unpivoted
