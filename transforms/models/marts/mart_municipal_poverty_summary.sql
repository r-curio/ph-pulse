with base as (

    select * from {{ ref('int_municipal_poverty_by_year') }}

),

with_change as (

    select
        pcode,
        region,
        province,
        municipality_city,
        year,
        is_preliminary,
        poverty_incidence_pct,
        standard_error,
        coefficient_of_variation,
        ci_90_lower,
        ci_90_upper,
        poverty_incidence_pct - lag(poverty_incidence_pct)
            over (partition by pcode order by year)
            as poverty_incidence_change,
        case
            when poverty_incidence_pct >= 20 then 'High'
            when poverty_incidence_pct >= 10 then 'Medium'
            else 'Low'
        end as poverty_tier
    from base

)

select * from with_change
