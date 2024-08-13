create table jobapplied(
    id serial primary key not null,
    job_id int not null,
    user_id int not null,
    applied_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    is_deleted boolean default('false'),
    foreign key(job_id) references jobs(id),
    foreign key(user_id) references users(id)
)