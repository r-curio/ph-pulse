with staged as (

    select * from {{ ref('stg_municipal_poverty_estimates') }}

),

unpivoted as (

    select
        pcode,
        region,
        province,
        municipality_city,
        2012 as year,
        prelim_2012 as is_preliminary,
        poverty_incidence_pct_2012 as poverty_incidence_pct,
        standard_error_2012 as standard_error,
        coefficient_of_variation_2012 as coefficient_of_variation,
        ci_90_lower_2012 as ci_90_lower,
        ci_90_upper_2012 as ci_90_upper
    from staged

    union all

    select
        pcode,
        region,
        province,
        municipality_city,
        2009 as year,
        cast(null as boolean) as is_preliminary,
        poverty_incidence_pct_2009 as poverty_incidence_pct,
        standard_error_2009 as standard_error,
        coefficient_of_variation_2009 as coefficient_of_variation,
        cast(null as float64) as ci_90_lower,
        cast(null as float64) as ci_90_upper
    from staged

    union all

    select
        pcode,
        region,
        province,
        municipality_city,
        2006 as year,
        cast(null as boolean) as is_preliminary,
        poverty_incidence_pct_2006 as poverty_incidence_pct,
        standard_error_2006 as standard_error,
        coefficient_of_variation_2006 as coefficient_of_variation,
        cast(null as float64) as ci_90_lower,
        cast(null as float64) as ci_90_upper
    from staged

)

select * from unpivoted
