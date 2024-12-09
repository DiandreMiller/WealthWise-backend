--
-- PostgreSQL database dump
--

-- Dumped from database version 14.15 (Homebrew)
-- Dumped by pg_dump version 14.15 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: budget; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.budget (
    user_id integer NOT NULL,
    monthly_income_goal numeric(10,2) NOT NULL,
    monthly_expense_goal numeric(10,2) NOT NULL,
    actual_income numeric(10,2) NOT NULL,
    actual_expenses numeric(10,2) NOT NULL,
    disposable_income numeric(10,2) GENERATED ALWAYS AS ((actual_income - actual_expenses)) STORED,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    budget_id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE public.budget OWNER TO postgres;

--
-- Data for Name: budget; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.budget (user_id, monthly_income_goal, monthly_expense_goal, actual_income, actual_expenses, created_at, updated_at, budget_id) FROM stdin;
\.


--
-- Name: budget budget_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget
    ADD CONSTRAINT budget_pkey PRIMARY KEY (budget_id);


--
-- PostgreSQL database dump complete
--

