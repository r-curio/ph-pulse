with base as (

    select * from {{ ref('int_poverty_families_5yr_by_region') }}

),

with_change as (

    select
        geo_level,
        geo_name,
        year,
        poverty_threshold_php,
        poverty_incidence_pct,
        coefficient_of_variation,
        magnitude_poor_families,
        poverty_incidence_pct - lag(poverty_incidence_pct)
            over (partition by geo_name order by year)
            as poverty_incidence_change,
        magnitude_poor_families - lag(magnitude_poor_families)
            over (partition by geo_name order by year)
            as magnitude_change,
        case
            when poverty_incidence_pct >= 20 then 'High'
            when poverty_incidence_pct >= 10 then 'Medium'
            else 'Low'
        end as poverty_tier
    from base

)

select * from with_change
