--
-- PostgreSQL database dump
--

-- Dumped from database version 16.4
-- Dumped by pg_dump version 16.4 (Homebrew)

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

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: tribe_user
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO tribe_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Chats; Type: TABLE; Schema: public; Owner: tribe_user
--

CREATE TABLE public."Chats" (
    id integer NOT NULL,
    "requesterId" integer NOT NULL,
    "helperId" integer NOT NULL,
    "taskId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL
);


ALTER TABLE public."Chats" OWNER TO tribe_user;

--
-- Name: Chats_id_seq; Type: SEQUENCE; Schema: public; Owner: tribe_user
--

CREATE SEQUENCE public."Chats_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Chats_id_seq" OWNER TO tribe_user;

--
-- Name: Chats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tribe_user
--

ALTER SEQUENCE public."Chats_id_seq" OWNED BY public."Chats".id;


--
-- Name: Messages; Type: TABLE; Schema: public; Owner: tribe_user
--

CREATE TABLE public."Messages" (
    id integer NOT NULL,
    "chatId" integer NOT NULL,
    "senderId" integer NOT NULL,
    content text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Messages" OWNER TO tribe_user;

--
-- Name: Messages_id_seq; Type: SEQUENCE; Schema: public; Owner: tribe_user
--

CREATE SEQUENCE public."Messages_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Messages_id_seq" OWNER TO tribe_user;

--
-- Name: Messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tribe_user
--

ALTER SEQUENCE public."Messages_id_seq" OWNED BY public."Messages".id;


--
-- Name: Reviews; Type: TABLE; Schema: public; Owner: tribe_user
--

CREATE TABLE public."Reviews" (
    id integer NOT NULL,
    rating integer NOT NULL,
    review text NOT NULL,
    user_id integer NOT NULL,
    reviewer_id integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Reviews" OWNER TO tribe_user;

--
-- Name: Reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: tribe_user
--

CREATE SEQUENCE public."Reviews_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Reviews_id_seq" OWNER TO tribe_user;

--
-- Name: Reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tribe_user
--

ALTER SEQUENCE public."Reviews_id_seq" OWNED BY public."Reviews".id;


--
-- Name: SequelizeMeta; Type: TABLE; Schema: public; Owner: tribe_user
--

CREATE TABLE public."SequelizeMeta" (
    name character varying(255) NOT NULL
);


ALTER TABLE public."SequelizeMeta" OWNER TO tribe_user;

--
-- Name: Tasks; Type: TABLE; Schema: public; Owner: tribe_user
--

CREATE TABLE public."Tasks" (
    id integer NOT NULL,
    "postContent" text NOT NULL,
    "locationDependent" boolean,
    location character varying(255),
    price numeric NOT NULL,
    "helperUsername" character varying(255),
    "userId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "acceptedByCount" integer DEFAULT 0 NOT NULL,
    "helperAcceptedId" integer,
    status character varying(255) DEFAULT 'open'::character varying NOT NULL,
    "taskName" character varying(255) NOT NULL
);


ALTER TABLE public."Tasks" OWNER TO tribe_user;

--
-- Name: Tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: tribe_user
--

CREATE SEQUENCE public."Tasks_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Tasks_id_seq" OWNER TO tribe_user;

--
-- Name: Tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tribe_user
--

ALTER SEQUENCE public."Tasks_id_seq" OWNED BY public."Tasks".id;


--
-- Name: Users; Type: TABLE; Schema: public; Owner: tribe_user
--

CREATE TABLE public."Users" (
    id integer NOT NULL,
    "firstName" character varying(255),
    "lastName" character varying(255),
    email character varying(255),
    password character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    about text,
    location character varying(255),
    experience text,
    age integer,
    gender character varying(255)
);


ALTER TABLE public."Users" OWNER TO tribe_user;

--
-- Name: Users_id_seq; Type: SEQUENCE; Schema: public; Owner: tribe_user
--

CREATE SEQUENCE public."Users_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Users_id_seq" OWNER TO tribe_user;

--
-- Name: Users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tribe_user
--

ALTER SEQUENCE public."Users_id_seq" OWNED BY public."Users".id;


--
-- Name: Chats id; Type: DEFAULT; Schema: public; Owner: tribe_user
--

ALTER TABLE ONLY public."Chats" ALTER COLUMN id SET DEFAULT nextval('public."Chats_id_seq"'::regclass);


--
-- Name: Messages id; Type: DEFAULT; Schema: public; Owner: tribe_user
--

ALTER TABLE ONLY public."Messages" ALTER COLUMN id SET DEFAULT nextval('public."Messages_id_seq"'::regclass);


--
-- Name: Reviews id; Type: DEFAULT; Schema: public; Owner: tribe_user
--

ALTER TABLE ONLY public."Reviews" ALTER COLUMN id SET DEFAULT nextval('public."Reviews_id_seq"'::regclass);


--
-- Name: Tasks id; Type: DEFAULT; Schema: public; Owner: tribe_user
--

ALTER TABLE ONLY public."Tasks" ALTER COLUMN id SET DEFAULT nextval('public."Tasks_id_seq"'::regclass);


--
-- Name: Users id; Type: DEFAULT; Schema: public; Owner: tribe_user
--

ALTER TABLE ONLY public."Users" ALTER COLUMN id SET DEFAULT nextval('public."Users_id_seq"'::regclass);


--
-- Data for Name: Chats; Type: TABLE DATA; Schema: public; Owner: tribe_user
--

COPY public."Chats" (id, "requesterId", "helperId", "taskId", "createdAt", "updatedAt", status) FROM stdin;
19	1	2	14	2024-09-01 01:18:44.849-04	2024-09-01 01:56:20.232-04	accepted
24	2	1	19	2024-09-03 00:58:42.608-04	2024-09-03 00:58:42.608-04	active
26	2	1	21	2024-09-03 01:20:58.584-04	2024-09-03 01:21:48.911-04	active
21	1	2	16	2024-09-01 22:14:32.714-04	2024-09-03 20:21:03.37-04	completed
20	1	2	15	2024-09-01 02:11:22.975-04	2024-09-03 20:21:14.783-04	completed
23	2	1	18	2024-09-03 00:15:51.188-04	2024-09-04 00:54:35.227-04	completed
27	2	1	22	2024-09-04 01:46:04.574-04	2024-09-04 01:48:18.059-04	completed
22	1	2	17	2024-09-02 01:12:26.978-04	2024-09-04 01:49:16.506-04	completed
25	1	2	20	2024-09-03 01:05:54.932-04	2024-09-04 21:18:18.655-04	completed
28	1	7	14	2024-09-14 16:16:52.279-04	2024-09-14 16:16:52.279-04	pending
\.


--
-- Data for Name: Messages; Type: TABLE DATA; Schema: public; Owner: tribe_user
--

COPY public."Messages" (id, "chatId", "senderId", content, "createdAt", "updatedAt") FROM stdin;
14	19	2	Hello, I’m Jane 	2024-09-01 01:18:56.351-04	2024-09-01 01:18:56.351-04
15	20	2	Hi!	2024-09-01 02:11:30.1-04	2024-09-01 02:11:30.1-04
16	21	2	Hi	2024-09-01 22:16:24.833-04	2024-09-01 22:16:24.833-04
17	21	2	I can help	2024-09-01 22:16:27.806-04	2024-09-01 22:16:27.806-04
18	26	1	Hello	2024-09-03 01:21:10.4-04	2024-09-03 01:21:10.4-04
19	22	1	Hi	2024-09-04 01:49:26.735-04	2024-09-04 01:49:26.735-04
20	22	1	Kicks 	2024-09-04 01:49:30.483-04	2024-09-04 01:49:30.483-04
21	25	1	Yyyy	2024-09-04 21:18:27.018-04	2024-09-04 21:18:27.018-04
\.


--
-- Data for Name: Reviews; Type: TABLE DATA; Schema: public; Owner: tribe_user
--

COPY public."Reviews" (id, rating, review, user_id, reviewer_id, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SequelizeMeta; Type: TABLE DATA; Schema: public; Owner: tribe_user
--

COPY public."SequelizeMeta" (name) FROM stdin;
20240810050954-create-user.js
20240817195643-add-profile-fields-to-user.js
20240817202639-create-reviews.js
20240818041114-add-acceptedByCount-to-tasks.js
20240818172740-create-chat.js
20240818173023-create-message.js
20240823235816-add-user-task-foreign-keys-to-chat.js
20240825035021-add-status-to-chats.js
20240901045345-add-task-name-to-tasks.js
20240912231912-remove-fields-from-tasks.js
\.


--
-- Data for Name: Tasks; Type: TABLE DATA; Schema: public; Owner: tribe_user
--

COPY public."Tasks" (id, "postContent", "locationDependent", location, price, "helperUsername", "userId", "createdAt", "updatedAt", "acceptedByCount", "helperAcceptedId", status, "taskName") FROM stdin;
19	Thank you	f		15		2	2024-09-03 00:58:21.148-04	2024-09-03 00:59:37.863-04	2	\N	accepted	Sell my books
21	Test	f		12		2	2024-09-03 01:20:30.203-04	2024-09-03 02:00:29.599-04	1	\N	completed	Test task
16	I need someone to build my ikea couch. 	f		10		1	2024-09-01 22:14:04.028-04	2024-09-03 20:21:03.35-04	1	\N	completed	Build ikea furniture 
15	Help me get rid of my couch. 	t	20 Bloor	25		1	2024-09-01 02:11:02.316-04	2024-09-03 20:21:14.78-04	1	\N	completed	Move a couch outside
18	Walk my dog today\n	f		440		2	2024-09-03 00:15:31.316-04	2024-09-04 00:54:35.208-04	2	\N	completed	Walk my dog 
22	Please	f		10		2	2024-09-04 01:45:52.511-04	2024-09-04 01:48:18.04-04	0	\N	completed	Find my dog
17	For 5 hours\n	f		30		1	2024-09-02 01:12:07.496-04	2024-09-04 01:49:16.502-04	10	\N	completed	Run my store 
20	Do this	f		10		1	2024-09-03 01:05:35.594-04	2024-09-04 21:18:18.653-04	1	\N	completed	New task
23	Today	\N		5	\N	2	2024-09-12 19:51:45.707-04	2024-09-12 19:51:45.707-04	0	\N	open	Walk my cat
24	Today\n	\N		5	\N	2	2024-09-12 20:42:26.077-04	2024-09-12 20:42:26.077-04	0	\N	open	Move heavy box
14	I need at least one roll right now. \n	t	20 Bloor street	10		1	2024-09-01 01:03:01.148-04	2024-09-14 16:16:52.288-04	1	\N	accepted	Deliver toilet paper roll
\.


--
-- Data for Name: Users; Type: TABLE DATA; Schema: public; Owner: tribe_user
--

COPY public."Users" (id, "firstName", "lastName", email, password, "createdAt", "updatedAt", about, location, experience, age, gender) FROM stdin;
3	Lebron	James	lebron@ex.com	$2b$10$7.CttLxCj55QpZgFp2LLC.qU3cBGDXbb4bLrIrTioB0NLUTCdRyd2	2024-08-17 00:59:23.717-04	2024-08-17 00:59:23.717-04	\N	\N	\N	\N	\N
4	Lebron	James	lebron@ex.com	$2b$10$VhlQb3cDFqeI/6m59Dny6OizQ9YdLHk.901DSqVR/EwjroLxdeUqi	2024-08-17 01:00:11.092-04	2024-08-17 01:00:11.092-04	\N	\N	\N	\N	\N
5	Lebron	James	lebron@ex.com	$2b$10$bFpRRnc.Y5Ab/2tURAFFZOy4ArAzYY78rr7o8OK.CEqncPvfTdPHK	2024-08-17 01:00:36.999-04	2024-08-17 01:00:36.999-04	\N	\N	\N	\N	\N
6	Kobe	Bryant 	kobe@ex.com	$2b$10$llamQ75CUgMr7h6fuafmvOvYzQJSQozrrnlVWZEpc0/bFIDRjQ8Jq	2024-08-17 01:02:27.952-04	2024-08-17 01:02:27.952-04	\N	\N	\N	\N	\N
1	John	Doe	john.doe@example.com	$2b$10$Q1aOzpCTQsFf7L1.lsIT1OAyO7JrCy0LKGnr49YGQfOI21XlTVKK2	2024-08-10 16:27:35.513-04	2024-08-24 02:21:08.847-04	From Seoul	\N	Handy work	22	Male
2	Jane	Doe	jane.doe@example.com	$2b$10$wwZhMnXb7WAsDPG5kcuCL.nOrPU6Cj05JGhX6wjgqE4joMoZQ7Z16	2024-08-11 12:46:35.408-04	2024-08-25 15:17:03.004-04	Hi!	Chicago	\N	\N	Woman
7	James	Wilson	james.wilson@gmail.com	$2b$10$rhaA9QnqXM7kktC/n.Q2ruQcoKTF5QmE50FE/qmn6ryNbjwyqqLjK	2024-09-14 16:16:38.249-04	2024-09-14 16:16:38.249-04	\N	\N	\N	\N	\N
\.


--
-- Name: Chats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tribe_user
--

SELECT pg_catalog.setval('public."Chats_id_seq"', 28, true);


--
-- Name: Messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tribe_user
--

SELECT pg_catalog.setval('public."Messages_id_seq"', 21, true);


--
-- Name: Reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tribe_user
--

SELECT pg_catalog.setval('public."Reviews_id_seq"', 1, false);


--
-- Name: Tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tribe_user
--

SELECT pg_catalog.setval('public."Tasks_id_seq"', 24, true);


--
-- Name: Users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tribe_user
--

SELECT pg_catalog.setval('public."Users_id_seq"', 7, true);


--
-- Name: Chats Chats_pkey; Type: CONSTRAINT; Schema: public; Owner: tribe_user
--

ALTER TABLE ONLY public."Chats"
    ADD CONSTRAINT "Chats_pkey" PRIMARY KEY (id);


--
-- Name: Messages Messages_pkey; Type: CONSTRAINT; Schema: public; Owner: tribe_user
--

ALTER TABLE ONLY public."Messages"
    ADD CONSTRAINT "Messages_pkey" PRIMARY KEY (id);


--
-- Name: Reviews Reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: tribe_user
--

ALTER TABLE ONLY public."Reviews"
    ADD CONSTRAINT "Reviews_pkey" PRIMARY KEY (id);


--
-- Name: SequelizeMeta SequelizeMeta_pkey; Type: CONSTRAINT; Schema: public; Owner: tribe_user
--

ALTER TABLE ONLY public."SequelizeMeta"
    ADD CONSTRAINT "SequelizeMeta_pkey" PRIMARY KEY (name);


--
-- Name: Tasks Tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: tribe_user
--

ALTER TABLE ONLY public."Tasks"
    ADD CONSTRAINT "Tasks_pkey" PRIMARY KEY (id);


--
-- Name: Users Users_pkey; Type: CONSTRAINT; Schema: public; Owner: tribe_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY (id);


--
-- Name: Chats Chats_helperId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tribe_user
--

ALTER TABLE ONLY public."Chats"
    ADD CONSTRAINT "Chats_helperId_fkey" FOREIGN KEY ("helperId") REFERENCES public."Users"(id) ON DELETE CASCADE;


--
-- Name: Chats Chats_requesterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tribe_user
--

ALTER TABLE ONLY public."Chats"
    ADD CONSTRAINT "Chats_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES public."Users"(id);


--
-- Name: Chats Chats_taskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tribe_user
--

ALTER TABLE ONLY public."Chats"
    ADD CONSTRAINT "Chats_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES public."Tasks"(id);


--
-- Name: Messages Messages_chatId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tribe_user
--

ALTER TABLE ONLY public."Messages"
    ADD CONSTRAINT "Messages_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES public."Chats"(id);


--
-- Name: Messages Messages_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tribe_user
--

ALTER TABLE ONLY public."Messages"
    ADD CONSTRAINT "Messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public."Users"(id);


--
-- Name: Reviews Reviews_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tribe_user
--

ALTER TABLE ONLY public."Reviews"
    ADD CONSTRAINT "Reviews_reviewer_id_fkey" FOREIGN KEY (reviewer_id) REFERENCES public."Users"(id) ON DELETE CASCADE;


--
-- Name: Reviews Reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tribe_user
--

ALTER TABLE ONLY public."Reviews"
    ADD CONSTRAINT "Reviews_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."Users"(id) ON DELETE CASCADE;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO tribe_user;


--
-- PostgreSQL database dump complete
--

