-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Students Table
create table if not exists students (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  roll_number text,
  class_grade text,
  section text,
  photo text,
  dob date,
  gender text,
  email text,
  phone text,
  address text,
  parent_name text,
  parent_phone text,
  parent_email text,
  admission_date date default current_date,
  guardian_name text,
  guardian_phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Teachers Table
create table if not exists teachers (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  photo text,
  domain text,
  email text,
  phone text,
  dob date,
  joining_date date,
  qualification text,
  experience text,
  address text,
  father_name text,
  mother_name text,
  subject text,
  assigned_classes text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Notices Table
create table if not exists notices (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  content text not null,
  date date default current_date,
  created_by text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Holidays Table
create table if not exists holidays (
  id uuid default uuid_generate_v4() primary key,
  date date not null,
  name text not null,
  type text
);

-- Fee Records Table
create table if not exists fee_records (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references students(id),
  total_fee numeric default 0,
  paid_amount numeric default 0,
  due_amount numeric generated always as (total_fee - paid_amount) stored,
  last_payment_date date,
  last_payment_amount numeric,
  terms jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Homeworks Table
create table if not exists homeworks (
  id uuid default uuid_generate_v4() primary key,
  class_grade text,
  section text,
  subject text,
  title text not null,
  description text,
  due_date date,
  created_by text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Complaints Table
create table if not exists complaints (
  id uuid default uuid_generate_v4() primary key,
  category text,
  date date default current_date,
  text text,
  status text check (status in ('pending', 'resolved')),
  student_id uuid references students(id),
  title text,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Attendance Records
create table if not exists attendance_records (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references students(id),
  date date default current_date,
  status text check (status in ('present', 'absent', 'late', 'excused')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Academic Records
create table if not exists academic_records (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references students(id),
  subject text,
  marks numeric,
  total_marks numeric,
  grade text,
  term text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table students enable row level security;
alter table teachers enable row level security;
alter table notices enable row level security;
alter table holidays enable row level security;
alter table fee_records enable row level security;
alter table homeworks enable row level security;
alter table complaints enable row level security;
alter table attendance_records enable row level security;
alter table academic_records enable row level security;

-- Public Read Policies (for development)
-- Public Access Policies (for development)
create policy "Public access" on students for all using (true) with check (true);
create policy "Public access" on teachers for all using (true) with check (true);
create policy "Public access" on notices for all using (true) with check (true);
create policy "Public access" on holidays for all using (true) with check (true);
create policy "Public access" on fee_records for all using (true) with check (true);
create policy "Public access" on homeworks for all using (true) with check (true);
create policy "Public access" on complaints for all using (true) with check (true);
create policy "Public access" on attendance_records for all using (true) with check (true);
create policy "Public access" on academic_records for all using (true) with check (true);
