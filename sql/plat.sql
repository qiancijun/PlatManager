create table plats(
	id serial primary key,
	user_id int not null,
	label varchar(255) not null,
	address varchar(255) not null,
	center text not null,
	path text,
	modal_url text,
	data_url text,
	updated_at timestamp
);