with base as (

    select * from {{ ref('int_poverty_by_region') }}

),

with_change as (

    select
        geo_level,
        geo_name,
        year,
        poverty_threshold_php,
        poverty_incidence_pct,
        coefficient_of_variation,
        standard_error,
        ci_lower,
        ci_upper,
        poverty_incidence_pct - lag(poverty_incidence_pct)
            over (partition by geo_name order by year)
            as poverty_incidence_change,
        case
            when poverty_incidence_pct >= 20 then 'High'
            when poverty_incidence_pct >= 10 then 'Medium'
            else 'Low'
        end as poverty_tier
    from base

)

select * from with_change
