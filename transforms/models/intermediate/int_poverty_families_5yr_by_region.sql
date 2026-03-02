with staged as (

    select * from {{ ref('stg_poverty_families_5yr') }}
    where geo_level in ('national', 'region')

),

unpivoted as (

    select
        geo_level,
        geo_name,
        1991 as year,
        poverty_threshold_php_1991 as poverty_threshold_php,
        poverty_incidence_pct_1991 as poverty_incidence_pct,
        coefficient_of_variation_1991 as coefficient_of_variation,
        magnitude_poor_families_1991 as magnitude_poor_families
    from staged

    union all

    select
        geo_level,
        geo_name,
        2006 as year,
        poverty_threshold_php_2006,
        poverty_incidence_pct_2006,
        coefficient_of_variation_2006,
        magnitude_poor_families_2006
    from staged

    union all

    select
        geo_level,
        geo_name,
        2009 as year,
        poverty_threshold_php_2009,
        poverty_incidence_pct_2009,
        coefficient_of_variation_2009,
        magnitude_poor_families_2009
    from staged

    union all

    select
        geo_level,
        geo_name,
        2012 as year,
        poverty_threshold_php_2012,
        poverty_incidence_pct_2012,
        coefficient_of_variation_2012,
        magnitude_poor_families_2012
    from staged

    union all

    select
        geo_level,
        geo_name,
        2015 as year,
        poverty_threshold_php_2015,
        poverty_incidence_pct_2015,
        coefficient_of_variation_2015,
        magnitude_poor_families_2015
    from staged

)

select * from unpivoted
