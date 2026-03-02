with source as (

    select * from {{ source('ph_pulse', 'raw_municipal_poverty_estimates') }}

),

cleaned as (

    select
        coalesce(
            nullif(trim(pcode), ''),
            concat('UNKNOWN_', trim(province), '_', regexp_replace(trim(municipality_city), r'\s+', '_'))
        ) as pcode,
        trim(region) as region,
        trim(province) as province,
        regexp_replace(trim(municipality_city), r'\s+', ' ')
            as municipality_city,

        -- prelim flag: handle 'TRUE', 'FALSE', 'n/a'
        case
            when lower(trim(prelim_2012)) = 'true' then true
            when lower(trim(prelim_2012)) = 'false' then false
            else null
        end as prelim_2012,

        -- 2012 metrics (missing values use '-')
        safe_cast(nullif(nullif(trim(poverty_incidence_pct_2012), '-'), '') as float64)
            as poverty_incidence_pct_2012,
        safe_cast(nullif(nullif(trim(standard_error_2012), '-'), '') as float64)
            as standard_error_2012,
        safe_cast(nullif(nullif(trim(coefficient_of_variation_2012), '-'), '') as float64)
            as coefficient_of_variation_2012,
        safe_cast(nullif(nullif(trim(ci_90_lower_2012), '-'), '') as float64)
            as ci_90_lower_2012,
        safe_cast(nullif(nullif(trim(ci_90_upper_2012), '-'), '') as float64)
            as ci_90_upper_2012,

        -- 2009 metrics
        safe_cast(nullif(nullif(trim(poverty_incidence_pct_2009), '-'), '') as float64)
            as poverty_incidence_pct_2009,
        safe_cast(nullif(nullif(trim(standard_error_2009), '-'), '') as float64)
            as standard_error_2009,
        safe_cast(nullif(nullif(trim(coefficient_of_variation_2009), '-'), '') as float64)
            as coefficient_of_variation_2009,

        -- 2006 metrics
        safe_cast(nullif(nullif(trim(poverty_incidence_pct_2006), '-'), '') as float64)
            as poverty_incidence_pct_2006,
        safe_cast(nullif(nullif(trim(standard_error_2006), '-'), '') as float64)
            as standard_error_2006,
        safe_cast(nullif(nullif(trim(coefficient_of_variation_2006), '-'), '') as float64)
            as coefficient_of_variation_2006

    from source

)

select * from cleaned
