create table jobs(
    id serial primary key ,
    company_name text ,
    job_title text ,
    no_of_openings numeric ,
    job_category text,
    job_location text,
    job_level text,
    experience text,
    expiry_date text,
    skills text,
    job_description text,
    salary text,
    posted_by text,
    created_at TIMESTAMPTZ not null ,
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    is_deleted boolean default('false')
);