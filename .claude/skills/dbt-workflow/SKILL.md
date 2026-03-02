---
name: dbt-workflow
description: Use when working with dbt models, running transformations, writing SQL models, adding dbt tests, or debugging dbt errors in the transforms/ directory.
---

# dbt Workflow for PH-Pulse

## Model Creation Checklist
1. Create the .sql file in the correct layer directory (staging/, intermediate/, or marts/)
2. Use {{ ref() }} for all upstream references
3. Add a corresponding entry in schema.yml with tests
4. Run `dbt run --select model_name` to build just that model
5. Run `dbt test --select model_name` to validate
6. Check the model appears correctly in `dbt docs generate`

## Naming Conventions
- Staging: `stg_{source}_{entity}.sql` (e.g., stg_psa_poverty.sql)
- Intermediate: `int_{domain}_{description}.sql` (e.g., int_regional_socioeconomic.sql)
- Marts: `mart_{description}.sql` (e.g., mart_regional_summary.sql)

## SQL Style
```sql
-- Always use CTEs, one concern per CTE
with cleaned as (
    select
        region_code,
        region_name,
        cast(year as int64) as year,
        cast(poverty_incidence_pct as float64) as poverty_incidence_pct
    from {{ ref('stg_poverty') }}
    where year is not null
),

enriched as (
    select
        *,
        lag(poverty_incidence_pct) over (
            partition by region_code order by year
        ) as prev_year_poverty
    from cleaned
)

select
    *,
    poverty_incidence_pct - prev_year_poverty as yoy_poverty_change
from enriched
```

## Testing Pattern
```yaml
models:
  - name: model_name
    columns:
      - name: primary_key_col
        tests: [not_null, unique]
      - name: categorical_col
        tests:
          - accepted_values:
              values: ['High', 'Medium', 'Low']
```

## Common Errors
- "Compilation Error: relation does not exist" → upstream model hasn't been run yet, use `dbt run` first
- "Test failure" → check the actual data with `dbt run && bq query`
- Schema mismatch → verify column types match between source and model
