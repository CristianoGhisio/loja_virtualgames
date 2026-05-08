--
-- PostgreSQL database dump
--

\restrict sEF7uqmZMzqkwLipymdHXbZ8hWzU55basFF1CWX8LcyMmf6ac96AgsXIqcEGZVL

-- Dumped from database version 15.15
-- Dumped by pg_dump version 15.15

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
-- Data for Name: Role; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Role" (id, name, description, "createdAt", "updatedAt") VALUES ('cmndrx1ej000txpl6qndp3u9o', 'ADMIN', 'Administrator', '2026-03-30 22:42:35.227', '2026-03-30 22:42:35.227');
INSERT INTO public."Role" (id, name, description, "createdAt", "updatedAt") VALUES ('cmndrx1wl0041xpl6b8kfhqng', 'SELLER', 'Sales Person', '2026-03-30 22:42:35.878', '2026-03-30 22:42:35.878');
INSERT INTO public."Role" (id, name, description, "createdAt", "updatedAt") VALUES ('cmndrx1zl004wxpl61rok9i7m', 'TECH', 'Technician', '2026-03-30 22:42:35.985', '2026-03-30 22:42:35.985');


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."User" (id, email, name, active, "createdAt", "updatedAt", "emailVerified", image, password, "roleId") VALUES ('cmndrx24x005oxpl63njyr4ps', 'admin@virtualgames.com', 'Admin Dono', true, '2026-03-30 22:42:36.177', '2026-03-30 22:42:36.177', NULL, NULL, '$2b$10$skFvR3H5KtP1zCq83YECTebhn7sBBstCtUp.n0eelb5GFuJUJ3ZR2', 'cmndrx1ej000txpl6qndp3u9o');


--
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: Attribute; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Attribute" (id, name, slug, type, "marketplaceRequired", "createdAt", "entitySource", "order") VALUES ('cmndrx2kk0086xpl65pu09ax0', 'Cor', 'cor', 'TEXT', false, '2026-03-30 22:42:36.74', 'NONE', 2);
INSERT INTO public."Attribute" (id, name, slug, type, "marketplaceRequired", "createdAt", "entitySource", "order") VALUES ('cmnezvfew0002lyycvfv5vbn0', 'Fornecedor', 'fornecedor', 'TEXT', false, '2026-03-31 19:13:03.176', 'SUPPLIER', 3);
INSERT INTO public."Attribute" (id, name, slug, type, "marketplaceRequired", "createdAt", "entitySource", "order") VALUES ('cmndrx2l4008cxpl6g41mkgac', 'Código Universal de Produto', 'codigo-universal', 'TEXT', false, '2026-03-30 22:42:36.76', 'NONE', 4);
INSERT INTO public."Attribute" (id, name, slug, type, "marketplaceRequired", "createdAt", "entitySource", "order") VALUES ('cmndrx2l1008bxpl6q7itcd29', 'GTIN', 'gtin', 'TEXT', true, '2026-03-30 22:42:36.757', 'NONE', 5);
INSERT INTO public."Attribute" (id, name, slug, type, "marketplaceRequired", "createdAt", "entitySource", "order") VALUES ('cmndrx2ky008axpl6rsxpx90g', 'Garantia', 'garantia', 'NUMBER', false, '2026-03-30 22:42:36.754', 'NONE', 6);
INSERT INTO public."Attribute" (id, name, slug, type, "marketplaceRequired", "createdAt", "entitySource", "order") VALUES ('cmndrx2kb0084xpl66f57n86j', 'Marca', 'marca', 'TEXT', true, '2026-03-30 22:42:36.731', 'NONE', 7);
INSERT INTO public."Attribute" (id, name, slug, type, "marketplaceRequired", "createdAt", "entitySource", "order") VALUES ('cmndrx2kn0087xpl60hc9x2rq', 'Memória RAM', 'memoria-ram', 'TEXT', false, '2026-03-30 22:42:36.744', 'NONE', 8);
INSERT INTO public."Attribute" (id, name, slug, type, "marketplaceRequired", "createdAt", "entitySource", "order") VALUES ('cmndrx2kr0088xpl6ujxuznjg', 'Voltagem', 'voltagem', 'LIST', false, '2026-03-30 22:42:36.747', 'NONE', 9);
INSERT INTO public."Attribute" (id, name, slug, type, "marketplaceRequired", "createdAt", "entitySource", "order") VALUES ('cmndrx2ku0089xpl67rzzrx5l', 'Condição', 'condicao', 'LIST', true, '2026-03-30 22:42:36.75', 'NONE', 1);
INSERT INTO public."Attribute" (id, name, slug, type, "marketplaceRequired", "createdAt", "entitySource", "order") VALUES ('cmndrx2kg0085xpl6alqzjc22', 'Armazenamento', 'armazenamento', 'TEXT', false, '2026-03-30 22:42:36.737', 'NONE', 0);


--
-- Data for Name: AttributeOption; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."AttributeOption" (id, "attributeId", value, label, "order", "createdAt", "updatedAt") VALUES ('cmnezw5xf000blyycwgif7slp', 'cmndrx2ku0089xpl67rzzrx5l', 'Novo', 'Novo', 0, '2026-03-31 19:13:37.539', '2026-03-31 19:13:37.539');
INSERT INTO public."AttributeOption" (id, "attributeId", value, label, "order", "createdAt", "updatedAt") VALUES ('cmnezw5xf000clyycv8673fl5', 'cmndrx2ku0089xpl67rzzrx5l', 'Usado', 'Usado', 1, '2026-03-31 19:13:37.539', '2026-03-31 19:13:37.539');


--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."AuditLog" (id, action, module, entity, "entityId", ip, "createdAt", "userId", "newValue", "oldValue") VALUES ('cmndsg0ui0000h739t6lm0bno', 'Excluiu usuário Pedro Técnico', 'ADMIN', 'User', 'cmndrx2ca005uxpl6a87npqwi', NULL, '2026-03-30 22:57:20.971', NULL, NULL, '{"name":"Pedro Técnico","email":"tecnico@virtualgames.com"}');
INSERT INTO public."AuditLog" (id, action, module, entity, "entityId", ip, "createdAt", "userId", "newValue", "oldValue") VALUES ('cmndshqgb0001h7392mdm0zlz', 'Excluiu usuário Maria Vendedora', 'ADMIN', 'User', 'cmndrx29u005sxpl656bfnijb', NULL, '2026-03-30 22:58:40.811', NULL, NULL, '{"name":"Maria Vendedora","email":"vendedor@virtualgames.com"}');
INSERT INTO public."AuditLog" (id, action, module, entity, "entityId", ip, "createdAt", "userId", "newValue", "oldValue") VALUES ('cmndshso60002h739740djdmi', 'Excluiu usuário João Gerente', 'ADMIN', 'User', 'cmndrx27g005qxpl655p534od', NULL, '2026-03-30 22:58:43.687', NULL, NULL, '{"name":"João Gerente","email":"gerente@virtualgames.com"}');
INSERT INTO public."AuditLog" (id, action, module, entity, "entityId", ip, "createdAt", "userId", "newValue", "oldValue") VALUES ('cmnf0fe3r000ilyyc5sbjr328', 'CLIENT_CREATE', 'customers', 'Client', 'cmnf0fe2z000hlyycctc7f2j3', '::1', '2026-03-31 19:28:34.599', NULL, NULL, NULL);
INSERT INTO public."AuditLog" (id, action, module, entity, "entityId", ip, "createdAt", "userId", "newValue", "oldValue") VALUES ('cmnf4p0yl002tlyycortj9ccw', 'Excluiu usuário Márcia Studer Ghisio', 'ADMIN', 'User', 'cmnf0dqkp000elyyc3aucdby4', NULL, '2026-03-31 21:28:02.589', NULL, NULL, '{"name":"Márcia Studer Ghisio","email":"marciaghisio@gmail.com"}');
INSERT INTO public."AuditLog" (id, action, module, entity, "entityId", ip, "createdAt", "userId", "newValue", "oldValue") VALUES ('cmnf6ejzr002ulyycdw6p6hon', 'CLIENT_DELETE', 'customers', 'Client', 'cmnf0fe2z000hlyycctc7f2j3', '::1', '2026-03-31 22:15:53.271', NULL, NULL, NULL);


--
-- Data for Name: CostCenter; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."CostCenter" (id, name, type, active) VALUES ('cmndrx2cg005vxpl62o4lz70v', 'Vendas de Produtos', 'REVENUE', true);
INSERT INTO public."CostCenter" (id, name, type, active) VALUES ('cmndrx2cg005wxpl6b9amrrl5', 'Serviços Técnicos', 'REVENUE', true);
INSERT INTO public."CostCenter" (id, name, type, active) VALUES ('cmndrx2cg005xxpl6fzhtnqus', 'Compra de Mercadoria', 'EXPENSE', true);
INSERT INTO public."CostCenter" (id, name, type, active) VALUES ('cmndrx2cg005yxpl6ihlf51no', 'Peças de Reposição', 'EXPENSE', true);
INSERT INTO public."CostCenter" (id, name, type, active) VALUES ('cmndrx2cg005zxpl6seba7cp7', 'Despesas Operacionais', 'EXPENSE', true);
INSERT INTO public."CostCenter" (id, name, type, active) VALUES ('cmnf3hwew002jlyycb43b99uv', 'Pagamento de Comissão Técnica', 'EXPENSE', true);


--
-- Data for Name: Customer; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: Supplier; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: Payable; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: Sale; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: ServiceOrder; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: Receivable; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: CashMovement; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Category" (id, name, description, active, "createdAt", "updatedAt", slug) VALUES ('cmndrx2cp0060xpl69fqhprbq', 'Console', 'Produtos da categoria Console', true, '2026-03-30 22:42:36.457', '2026-03-30 22:42:36.457', 'console');
INSERT INTO public."Category" (id, name, description, active, "createdAt", "updatedAt", slug) VALUES ('cmndrx2cz0063xpl6g8j5nn4x', 'Jogo', 'Produtos da categoria Jogo', true, '2026-03-30 22:42:36.468', '2026-03-30 22:42:36.468', 'jogo');
INSERT INTO public."Category" (id, name, description, active, "createdAt", "updatedAt", slug) VALUES ('cmndrx2d60066xpl6nc7btcxn', 'Computador', 'Produtos da categoria Computador', true, '2026-03-30 22:42:36.474', '2026-03-30 22:42:36.474', 'computador');
INSERT INTO public."Category" (id, name, description, active, "createdAt", "updatedAt", slug) VALUES ('cmndrx2dd0069xpl6ddqh77tl', 'Placa', 'Produtos da categoria Placa', true, '2026-03-30 22:42:36.481', '2026-03-30 22:42:36.481', 'placa');
INSERT INTO public."Category" (id, name, description, active, "createdAt", "updatedAt", slug) VALUES ('cmndrx2dk006cxpl6rtdo5nnt', 'Hardware', 'Produtos da categoria Hardware', true, '2026-03-30 22:42:36.488', '2026-03-30 22:42:36.488', 'hardware');
INSERT INTO public."Category" (id, name, description, active, "createdAt", "updatedAt", slug) VALUES ('cmndrx2dr006fxpl6inufoqdt', 'Periférico', 'Produtos da categoria Periférico', true, '2026-03-30 22:42:36.495', '2026-03-30 22:42:36.495', 'periferico');
INSERT INTO public."Category" (id, name, description, active, "createdAt", "updatedAt", slug) VALUES ('cmndrx2dx006ixpl6vsx8qxdb', 'Smartphone', 'Produtos da categoria Smartphone', true, '2026-03-30 22:42:36.502', '2026-03-30 22:42:36.502', 'smartphone');
INSERT INTO public."Category" (id, name, description, active, "createdAt", "updatedAt", slug) VALUES ('cmndrx2e5006lxpl613j3lba5', 'Tablet', 'Produtos da categoria Tablet', true, '2026-03-30 22:42:36.509', '2026-03-30 22:42:36.509', 'tablet');
INSERT INTO public."Category" (id, name, description, active, "createdAt", "updatedAt", slug) VALUES ('cmndrx2eb006oxpl6v9f1vglh', 'Wearable', 'Produtos da categoria Wearable', true, '2026-03-30 22:42:36.515', '2026-03-30 22:42:36.515', 'wearable');
INSERT INTO public."Category" (id, name, description, active, "createdAt", "updatedAt", slug) VALUES ('cmndrx2ei006rxpl6mxknd5s9', 'Televisor', 'Produtos da categoria Televisor', true, '2026-03-30 22:42:36.522', '2026-03-30 22:42:36.522', 'televisor');
INSERT INTO public."Category" (id, name, description, active, "createdAt", "updatedAt", slug) VALUES ('cmndrx2eo006uxpl61ofifoig', 'Monitor', 'Produtos da categoria Monitor', true, '2026-03-30 22:42:36.529', '2026-03-30 22:42:36.529', 'monitor');
INSERT INTO public."Category" (id, name, description, active, "createdAt", "updatedAt", slug) VALUES ('cmndrx2ev006xxpl63n3jy2az', 'Áudio e Vídeo', 'Produtos da categoria Áudio e Vídeo', true, '2026-03-30 22:42:36.535', '2026-03-30 22:42:36.535', 'audio-e-video');
INSERT INTO public."Category" (id, name, description, active, "createdAt", "updatedAt", slug) VALUES ('cmndrx2f20070xpl6dbckhnh5', 'Armazenamento', 'Produtos da categoria Armazenamento', true, '2026-03-30 22:42:36.542', '2026-03-30 22:42:36.542', 'armazenamento');
INSERT INTO public."Category" (id, name, description, active, "createdAt", "updatedAt", slug) VALUES ('cmndrx2f80073xpl6v83yzabd', 'Rede', 'Produtos da categoria Rede', true, '2026-03-30 22:42:36.549', '2026-03-30 22:42:36.549', 'rede');
INSERT INTO public."Category" (id, name, description, active, "createdAt", "updatedAt", slug) VALUES ('cmndrx2fg0076xpl61iv6rtgj', 'Energia', 'Produtos da categoria Energia', true, '2026-03-30 22:42:36.556', '2026-03-30 22:42:36.556', 'energia');
INSERT INTO public."Category" (id, name, description, active, "createdAt", "updatedAt", slug) VALUES ('cmndrx2fm0079xpl62qt3j22j', 'Peça', 'Produtos da categoria Peça', true, '2026-03-30 22:42:36.562', '2026-03-30 22:42:36.562', 'peca');
INSERT INTO public."Category" (id, name, description, active, "createdAt", "updatedAt", slug) VALUES ('cmndrx2ft007cxpl6zucv9gip', 'Acessório', 'Produtos da categoria Acessório', true, '2026-03-30 22:42:36.569', '2026-03-30 22:42:36.569', 'acessorio');
INSERT INTO public."Category" (id, name, description, active, "createdAt", "updatedAt", slug) VALUES ('cmndrx2fz007fxpl68zusnpei', 'Diverso', 'Produtos da categoria Diverso', true, '2026-03-30 22:42:36.576', '2026-03-30 22:42:36.576', 'diverso');


--
-- Data for Name: CustomerFunnelCard; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: CustomerInteraction; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: DailyMetrics; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: Employee; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Employee" (id, "nomeCompleto", cpf, "dataNascimento", "celularWhatsapp", "emailPessoal", "dataAdmissao", "cargoFuncao", "tipoContrato", "salarioBase", "percentualComissao", "chavePix", status, "userId", "createdAt", "updatedAt", "descricaoPerfil", "fotoUrl") VALUES ('cmndvxqpi0001hbtat6zvkeqd', 'Emerson Gabriel de Mello Graeff', '123.456.789-00', '2000-01-01 00:00:00', '(55) 99999-9999', 'email@email.com', '2020-01-01 00:00:00', 'CEO da Virtual Games', 'SOCIO', 2000.00, NULL, NULL, 'ATIVO', 'cmndrx24x005oxpl63njyr4ps', '2026-03-31 00:35:06.486', '2026-03-31 22:17:17.257', 'Minha história com videogames começou lá atrás, em2010, com um Nintendo. Desde então, o controle nunca mais saiu da minha mão. Eu entendo que um jogo não é apenas um passatempo; é uma história, uma aventura e, muitas vezes, o nosso refúgio.
Criei a Virtual Games porque sentia falta de um lugar feito de jogadores para jogadores. Um espaço onde a qualidade do produto é garantida e o atendimento é feito por quem realmente entende do assunto.
Aqui, eu pessoalmente seleciono cada produto que chega à prateleira. Se eu não jogaria, eu não vendo.
Mais do que vender games, meu objetivo é garantir que você tenha a melhor experiência possível, do unboxing à platina.', '/uploads/employees/1774917247114-e746f8a9-fac3-4fef-8cbd-e0bb8e4712c1.png');


--
-- Data for Name: Manufacturer; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Manufacturer" (id, name, slug, website, active, "createdAt", "updatedAt") VALUES ('cmndrx2i4007ixpl60whgubn4', 'Samsung', 'samsung', 'https://www.samsung.com', true, '2026-03-30 22:42:36.653', '2026-03-30 22:42:36.653');
INSERT INTO public."Manufacturer" (id, name, slug, website, active, "createdAt", "updatedAt") VALUES ('cmndrx2ib007jxpl6khptry9f', 'Apple', 'apple', 'https://www.apple.com', true, '2026-03-30 22:42:36.659', '2026-03-30 22:42:36.659');
INSERT INTO public."Manufacturer" (id, name, slug, website, active, "createdAt", "updatedAt") VALUES ('cmndrx2ie007kxpl6bhlkery8', 'Sony', 'sony', 'https://www.sony.com', true, '2026-03-30 22:42:36.662', '2026-03-30 22:42:36.662');
INSERT INTO public."Manufacturer" (id, name, slug, website, active, "createdAt", "updatedAt") VALUES ('cmndrx2ih007lxpl6qxemgyj6', 'Dell', 'dell', 'https://www.dell.com', true, '2026-03-30 22:42:36.665', '2026-03-30 22:42:36.665');
INSERT INTO public."Manufacturer" (id, name, slug, website, active, "createdAt", "updatedAt") VALUES ('cmndrx2ik007mxpl6ur5aht5q', 'HP', 'hp', 'https://www.hp.com', true, '2026-03-30 22:42:36.668', '2026-03-30 22:42:36.668');
INSERT INTO public."Manufacturer" (id, name, slug, website, active, "createdAt", "updatedAt") VALUES ('cmndrx2in007nxpl6mnfj2qb3', 'Logitech', 'logitech', 'https://www.logitech.com', true, '2026-03-30 22:42:36.672', '2026-03-30 22:42:36.672');
INSERT INTO public."Manufacturer" (id, name, slug, website, active, "createdAt", "updatedAt") VALUES ('cmndrx2iq007oxpl6otrp4c7h', 'Asus', 'asus', 'https://www.asus.com', true, '2026-03-30 22:42:36.675', '2026-03-30 22:42:36.675');
INSERT INTO public."Manufacturer" (id, name, slug, website, active, "createdAt", "updatedAt") VALUES ('cmndrx2iu007pxpl603iz4ii7', 'Acer', 'acer', 'https://www.acer.com', true, '2026-03-30 22:42:36.678', '2026-03-30 22:42:36.678');
INSERT INTO public."Manufacturer" (id, name, slug, website, active, "createdAt", "updatedAt") VALUES ('cmndrx2ix007qxpl6pc6856ln', 'Microsoft', 'microsoft', 'https://www.microsoft.com', true, '2026-03-30 22:42:36.681', '2026-03-30 22:42:36.681');
INSERT INTO public."Manufacturer" (id, name, slug, website, active, "createdAt", "updatedAt") VALUES ('cmndrx2j0007rxpl6jt5ajc76', 'Nintendo', 'nintendo', 'https://www.nintendo.com', true, '2026-03-30 22:42:36.684', '2026-03-30 22:42:36.684');
INSERT INTO public."Manufacturer" (id, name, slug, website, active, "createdAt", "updatedAt") VALUES ('cmndrx2j4007sxpl6wsbts5ml', 'LG', 'lg', 'https://www.lg.com', true, '2026-03-30 22:42:36.689', '2026-03-30 22:42:36.689');
INSERT INTO public."Manufacturer" (id, name, slug, website, active, "createdAt", "updatedAt") VALUES ('cmndrx2j8007txpl615nemtld', 'Motorola', 'motorola', 'https://www.motorola.com', true, '2026-03-30 22:42:36.692', '2026-03-30 22:42:36.692');
INSERT INTO public."Manufacturer" (id, name, slug, website, active, "createdAt", "updatedAt") VALUES ('cmndrx2jc007uxpl6r2ikhhoc', 'Xiaomi', 'xiaomi', 'https://www.mi.com', true, '2026-03-30 22:42:36.696', '2026-03-30 22:42:36.696');
INSERT INTO public."Manufacturer" (id, name, slug, website, active, "createdAt", "updatedAt") VALUES ('cmndrx2jg007vxpl6qc7t5a50', 'Intel', 'intel', 'https://www.intel.com', true, '2026-03-30 22:42:36.7', '2026-03-30 22:42:36.7');
INSERT INTO public."Manufacturer" (id, name, slug, website, active, "createdAt", "updatedAt") VALUES ('cmndrx2jk007wxpl613yz2y7h', 'AMD', 'amd', 'https://www.amd.com', true, '2026-03-30 22:42:36.704', '2026-03-30 22:42:36.704');
INSERT INTO public."Manufacturer" (id, name, slug, website, active, "createdAt", "updatedAt") VALUES ('cmndrx2jn007xxpl68i3iwhli', 'Nvidia', 'nvidia', 'https://www.nvidia.com', true, '2026-03-30 22:42:36.708', '2026-03-30 22:42:36.708');
INSERT INTO public."Manufacturer" (id, name, slug, website, active, "createdAt", "updatedAt") VALUES ('cmndrx2jr007yxpl67a5mad0n', 'Kingston', 'kingston', 'https://www.kingston.com', true, '2026-03-30 22:42:36.711', '2026-03-30 22:42:36.711');
INSERT INTO public."Manufacturer" (id, name, slug, website, active, "createdAt", "updatedAt") VALUES ('cmndrx2ju007zxpl632wqeb1t', 'SanDisk', 'sandisk', 'https://www.westerndigital.com', true, '2026-03-30 22:42:36.714', '2026-03-30 22:42:36.714');
INSERT INTO public."Manufacturer" (id, name, slug, website, active, "createdAt", "updatedAt") VALUES ('cmndrx2jx0080xpl6h4fsu3vc', 'TP-Link', 'tp-link', 'https://www.tp-link.com', true, '2026-03-30 22:42:36.718', '2026-03-30 22:42:36.718');
INSERT INTO public."Manufacturer" (id, name, slug, website, active, "createdAt", "updatedAt") VALUES ('cmndrx2k10081xpl6y30i96u2', 'JBL', 'jbl', 'https://www.jbl.com', true, '2026-03-30 22:42:36.721', '2026-03-30 22:42:36.721');
INSERT INTO public."Manufacturer" (id, name, slug, website, active, "createdAt", "updatedAt") VALUES ('cmndrx2k40082xpl6dp62yfwf', 'Corsair', 'corsair', 'https://www.corsair.com', true, '2026-03-30 22:42:36.724', '2026-03-30 22:42:36.724');
INSERT INTO public."Manufacturer" (id, name, slug, website, active, "createdAt", "updatedAt") VALUES ('cmndrx2k70083xpl6ufrfw864', 'Razer', 'razer', 'https://www.razer.com', true, '2026-03-30 22:42:36.727', '2026-03-30 22:42:36.727');


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: Item; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: Marketplace; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Marketplace" (id, name, "apiCode", active, "createdAt", "updatedAt") VALUES ('cmndrx2l7008dxpl674b53e49', 'Mercado Livre', 'MLB', true, '2026-03-30 22:42:36.764', '2026-03-30 22:42:36.764');
INSERT INTO public."Marketplace" (id, name, "apiCode", active, "createdAt", "updatedAt") VALUES ('cmndrx2lh008expl6xsyo98sz', 'Shopee', 'SHOPEE', true, '2026-03-30 22:42:36.773', '2026-03-30 22:42:36.773');


--
-- Data for Name: MarketplaceCategory; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: ProductVariation; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: MarketplaceListing; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: PaymentFeeSettings; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: Permission; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Permission" (id, action, resource, description, "createdAt", "updatedAt") VALUES ('cmndrx1bg0001xpl6e47ioyhi', 'create', 'users', 'Create users', '2026-03-30 22:42:35.116', '2026-03-30 22:42:35.116');
INSERT INTO public."Permission" (id, action, resource, description, "createdAt", "updatedAt") VALUES ('cmndrx1bj0002xpl6xaen492k', 'read', 'users', 'Read users', '2026-03-30 22:42:35.12', '2026-03-30 22:42:35.12');
INSERT INTO public."Permission" (id, action, resource, description, "createdAt", "updatedAt") VALUES ('cmndrx1bn0003xpl6r9oqvl0k', 'update', 'users', 'Update users', '2026-03-30 22:42:35.123', '2026-03-30 22:42:35.123');
INSERT INTO public."Permission" (id, action, resource, description, "createdAt", "updatedAt") VALUES ('cmndrx1br0004xpl6u8dzy2c2', 'delete', 'users', 'Delete users', '2026-03-30 22:42:35.127', '2026-03-30 22:42:35.127');
INSERT INTO public."Permission" (id, action, resource, description, "createdAt", "updatedAt") VALUES ('cmndrx1bv0005xpl6vrg8iwbv', 'create', 'clients', 'Create clients', '2026-03-30 22:42:35.131', '2026-03-30 22:42:35.131');
INSERT INTO public."Permission" (id, action, resource, description, "createdAt", "updatedAt") VALUES ('cmndrx1bz0006xpl608pa99r5', 'read', 'clients', 'Read clients', '2026-03-30 22:42:35.135', '2026-03-30 22:42:35.135');
INSERT INTO public."Permission" (id, action, resource, description, "createdAt", "updatedAt") VALUES ('cmndrx1c30007xpl6i83t4ffk', 'update', 'clients', 'Update clients', '2026-03-30 22:42:35.139', '2026-03-30 22:42:35.139');
INSERT INTO public."Permission" (id, action, resource, description, "createdAt", "updatedAt") VALUES ('cmndrx1c70008xpl6ai01tcxl', 'delete', 'clients', 'Delete clients', '2026-03-30 22:42:35.144', '2026-03-30 22:42:35.144');
INSERT INTO public."Permission" (id, action, resource, description, "createdAt", "updatedAt") VALUES ('cmndrx1cb0009xpl6t0zi9su3', 'create', 'products', 'Create products', '2026-03-30 22:42:35.147', '2026-03-30 22:42:35.147');
INSERT INTO public."Permission" (id, action, resource, description, "createdAt", "updatedAt") VALUES ('cmndrx1cf000axpl65qtnzp9f', 'read', 'products', 'Read products', '2026-03-30 22:42:35.151', '2026-03-30 22:42:35.151');
INSERT INTO public."Permission" (id, action, resource, description, "createdAt", "updatedAt") VALUES ('cmndrx1cj000bxpl6r86rzy8x', 'update', 'products', 'Update products', '2026-03-30 22:42:35.155', '2026-03-30 22:42:35.155');
INSERT INTO public."Permission" (id, action, resource, description, "createdAt", "updatedAt") VALUES ('cmndrx1cn000cxpl6ugq0a971', 'delete', 'products', 'Delete products', '2026-03-30 22:42:35.159', '2026-03-30 22:42:35.159');
INSERT INTO public."Permission" (id, action, resource, description, "createdAt", "updatedAt") VALUES ('cmndrx1cr000dxpl6qqha1it0', 'read', 'stock', 'View stock', '2026-03-30 22:42:35.164', '2026-03-30 22:42:35.164');
INSERT INTO public."Permission" (id, action, resource, description, "createdAt", "updatedAt") VALUES ('cmndrx1cv000expl6gl2fdmfx', 'manage', 'stock', 'Manage stock movements', '2026-03-30 22:42:35.168', '2026-03-30 22:42:35.168');
INSERT INTO public."Permission" (id, action, resource, description, "createdAt", "updatedAt") VALUES ('cmndrx1d0000fxpl63dfm9pus', 'create', 'sales', 'Create sales', '2026-03-30 22:42:35.172', '2026-03-30 22:42:35.172');
INSERT INTO public."Permission" (id, action, resource, description, "createdAt", "updatedAt") VALUES ('cmndrx1d7000hxpl6p4sgwtgv', 'update', 'sales', 'Update sales', '2026-03-30 22:42:35.179', '2026-03-30 22:42:35.179');
INSERT INTO public."Permission" (id, action, resource, description, "createdAt", "updatedAt") VALUES ('cmndrx1da000ixpl6skph158a', 'delete', 'sales', 'Cancel/Delete sales', '2026-03-30 22:42:35.182', '2026-03-30 22:42:35.182');
INSERT INTO public."Permission" (id, action, resource, description, "createdAt", "updatedAt") VALUES ('cmndrx1dd000jxpl61qafwy17', 'create', 'os', 'Create OS', '2026-03-30 22:42:35.186', '2026-03-30 22:42:35.186');
INSERT INTO public."Permission" (id, action, resource, description, "createdAt", "updatedAt") VALUES ('cmndrx1dk000lxpl6wy8uuv3a', 'update', 'os', 'Update OS', '2026-03-30 22:42:35.193', '2026-03-30 22:42:35.193');
INSERT INTO public."Permission" (id, action, resource, description, "createdAt", "updatedAt") VALUES ('cmndrx1do000mxpl6jjrk0psx', 'delete', 'os', 'Delete OS', '2026-03-30 22:42:35.196', '2026-03-30 22:42:35.196');
INSERT INTO public."Permission" (id, action, resource, description, "createdAt", "updatedAt") VALUES ('cmndrx1dr000nxpl66autecuy', 'read', 'finance', 'View financial data', '2026-03-30 22:42:35.2', '2026-03-30 22:42:35.2');
INSERT INTO public."Permission" (id, action, resource, description, "createdAt", "updatedAt") VALUES ('cmndrx1dv000oxpl6h812i6yp', 'manage', 'finance', 'Manage finances', '2026-03-30 22:42:35.204', '2026-03-30 22:42:35.204');
INSERT INTO public."Permission" (id, action, resource, description, "createdAt", "updatedAt") VALUES ('cmndrx1e7000rxpl6wvezoy8c', 'manage', 'settings', 'Manage settings', '2026-03-30 22:42:35.216', '2026-03-30 22:42:35.216');
INSERT INTO public."Permission" (id, action, resource, description, "createdAt", "updatedAt") VALUES ('cmndrx1eb000sxpl6mggqk7s7', 'manage', 'admin', 'System administration', '2026-03-30 22:42:35.22', '2026-03-30 22:42:35.22');
INSERT INTO public."Permission" (id, action, resource, description, "createdAt", "updatedAt") VALUES ('cmndrx1b70000xpl6jccigi0q', 'read', 'dashboard', 'Acesso ao Dashboard', '2026-03-30 22:42:35.108', '2026-03-31 01:42:10.257');
INSERT INTO public."Permission" (id, action, resource, description, "createdAt", "updatedAt") VALUES ('cmnds00rp0002yzzkebdjsz39', 'read', 'cash-daily', 'Acesso ao Caixa Diário', '2026-03-30 22:44:54.373', '2026-03-31 01:42:10.267');
INSERT INTO public."Permission" (id, action, resource, description, "createdAt", "updatedAt") VALUES ('cmnds00sg0003yzzk9z7kham2', 'read', 'atendimento', 'Acesso ao Atendimento', '2026-03-30 22:44:54.401', '2026-03-31 01:42:10.275');
INSERT INTO public."Permission" (id, action, resource, description, "createdAt", "updatedAt") VALUES ('cmnds00t30004yzzkuth4mfti', 'read', 'customers', 'Acesso aos Clientes', '2026-03-30 22:44:54.423', '2026-03-31 01:42:10.281');
INSERT INTO public."Permission" (id, action, resource, description, "createdAt", "updatedAt") VALUES ('cmndvm3rc0004zv1yic8z4jt8', 'read', 'employees', 'Acesso aos Funcionários', '2026-03-31 00:26:03.528', '2026-03-31 01:42:10.287');
INSERT INTO public."Permission" (id, action, resource, description, "createdAt", "updatedAt") VALUES ('cmnds00tb0005yzzkf6wa5kra', 'read', 'registers', 'Acesso ao Controle (Cadastros)', '2026-03-30 22:44:54.431', '2026-03-31 01:42:10.294');
INSERT INTO public."Permission" (id, action, resource, description, "createdAt", "updatedAt") VALUES ('cmndrx1d3000gxpl6q7m2ps0y', 'read', 'sales', 'Acesso a Vendas', '2026-03-30 22:42:35.176', '2026-03-31 01:42:10.3');
INSERT INTO public."Permission" (id, action, resource, description, "createdAt", "updatedAt") VALUES ('cmndrx1dh000kxpl6u4n3rleq', 'read', 'os', 'Acesso às OS', '2026-03-30 22:42:35.189', '2026-03-31 01:42:10.306');
INSERT INTO public."Permission" (id, action, resource, description, "createdAt", "updatedAt") VALUES ('cmnds00vi0008yzzk00nxraxn', 'read', 'financial', 'Acesso ao Financeiro', '2026-03-30 22:44:54.51', '2026-03-31 01:42:10.314');
INSERT INTO public."Permission" (id, action, resource, description, "createdAt", "updatedAt") VALUES ('cmndrx1dz000pxpl6xabhqxke', 'read', 'reports', 'Acesso aos Relatórios', '2026-03-30 22:42:35.208', '2026-03-31 01:42:10.321');
INSERT INTO public."Permission" (id, action, resource, description, "createdAt", "updatedAt") VALUES ('cmnds00wq000ayzzk0qaf0grf', 'read', 'admin', 'Acesso ao Admin', '2026-03-30 22:44:54.554', '2026-03-31 01:42:10.327');
INSERT INTO public."Permission" (id, action, resource, description, "createdAt", "updatedAt") VALUES ('cmndrx1e3000qxpl6qvxu5970', 'read', 'settings', 'Acesso às Configurações', '2026-03-30 22:42:35.211', '2026-03-31 01:42:10.333');


--
-- Data for Name: ProductAttribute; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: ProductPriceHistory; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: RolePermission; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx1eo000vxpl6269wldht', 'cmndrx1ej000txpl6qndp3u9o', 'cmndrx1b70000xpl6jccigi0q', '2026-03-30 22:42:35.232', '2026-03-30 22:42:35.232');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx1f0000xxpl6ijs37qg5', 'cmndrx1ej000txpl6qndp3u9o', 'cmndrx1bg0001xpl6e47ioyhi', '2026-03-30 22:42:35.244', '2026-03-30 22:42:35.244');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx1fb000zxpl6czsad50y', 'cmndrx1ej000txpl6qndp3u9o', 'cmndrx1bj0002xpl6xaen492k', '2026-03-30 22:42:35.255', '2026-03-30 22:42:35.255');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx1fi0011xpl64n4uq0vc', 'cmndrx1ej000txpl6qndp3u9o', 'cmndrx1bn0003xpl6r9oqvl0k', '2026-03-30 22:42:35.262', '2026-03-30 22:42:35.262');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx1fp0013xpl6507f7djd', 'cmndrx1ej000txpl6qndp3u9o', 'cmndrx1br0004xpl6u8dzy2c2', '2026-03-30 22:42:35.269', '2026-03-30 22:42:35.269');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx1fv0015xpl670r808wl', 'cmndrx1ej000txpl6qndp3u9o', 'cmndrx1bv0005xpl6vrg8iwbv', '2026-03-30 22:42:35.276', '2026-03-30 22:42:35.276');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx1g20017xpl6cll72cdi', 'cmndrx1ej000txpl6qndp3u9o', 'cmndrx1bz0006xpl608pa99r5', '2026-03-30 22:42:35.283', '2026-03-30 22:42:35.283');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx1g90019xpl6rlreke49', 'cmndrx1ej000txpl6qndp3u9o', 'cmndrx1c30007xpl6i83t4ffk', '2026-03-30 22:42:35.289', '2026-03-30 22:42:35.289');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx1gg001bxpl6n5b21ja1', 'cmndrx1ej000txpl6qndp3u9o', 'cmndrx1c70008xpl6ai01tcxl', '2026-03-30 22:42:35.297', '2026-03-30 22:42:35.297');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx1go001dxpl6zet9pln9', 'cmndrx1ej000txpl6qndp3u9o', 'cmndrx1cb0009xpl6t0zi9su3', '2026-03-30 22:42:35.304', '2026-03-30 22:42:35.304');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx1gv001fxpl6aqlepr1m', 'cmndrx1ej000txpl6qndp3u9o', 'cmndrx1cf000axpl65qtnzp9f', '2026-03-30 22:42:35.311', '2026-03-30 22:42:35.311');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx1h2001hxpl6nzvu9tws', 'cmndrx1ej000txpl6qndp3u9o', 'cmndrx1cj000bxpl6r86rzy8x', '2026-03-30 22:42:35.318', '2026-03-30 22:42:35.318');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx1h9001jxpl6yptd3y4r', 'cmndrx1ej000txpl6qndp3u9o', 'cmndrx1cn000cxpl6ugq0a971', '2026-03-30 22:42:35.325', '2026-03-30 22:42:35.325');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx1hg001lxpl6y0knnhof', 'cmndrx1ej000txpl6qndp3u9o', 'cmndrx1cr000dxpl6qqha1it0', '2026-03-30 22:42:35.332', '2026-03-30 22:42:35.332');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx1hn001nxpl60anyjxsw', 'cmndrx1ej000txpl6qndp3u9o', 'cmndrx1cv000expl6gl2fdmfx', '2026-03-30 22:42:35.339', '2026-03-30 22:42:35.339');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx1hw001pxpl6d9tqprhg', 'cmndrx1ej000txpl6qndp3u9o', 'cmndrx1d0000fxpl63dfm9pus', '2026-03-30 22:42:35.349', '2026-03-30 22:42:35.349');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx1i6001rxpl6m5mclquo', 'cmndrx1ej000txpl6qndp3u9o', 'cmndrx1d3000gxpl6q7m2ps0y', '2026-03-30 22:42:35.359', '2026-03-30 22:42:35.359');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx1ih001txpl61ecrarqf', 'cmndrx1ej000txpl6qndp3u9o', 'cmndrx1d7000hxpl6p4sgwtgv', '2026-03-30 22:42:35.369', '2026-03-30 22:42:35.369');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx1is001vxpl6kpnadpg9', 'cmndrx1ej000txpl6qndp3u9o', 'cmndrx1da000ixpl6skph158a', '2026-03-30 22:42:35.38', '2026-03-30 22:42:35.38');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx1j4001xxpl6ao1m42la', 'cmndrx1ej000txpl6qndp3u9o', 'cmndrx1dd000jxpl61qafwy17', '2026-03-30 22:42:35.393', '2026-03-30 22:42:35.393');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx1jh001zxpl6ko8dpp6l', 'cmndrx1ej000txpl6qndp3u9o', 'cmndrx1dh000kxpl6u4n3rleq', '2026-03-30 22:42:35.405', '2026-03-30 22:42:35.405');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx1k20021xpl6k18l0m18', 'cmndrx1ej000txpl6qndp3u9o', 'cmndrx1dk000lxpl6wy8uuv3a', '2026-03-30 22:42:35.426', '2026-03-30 22:42:35.426');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx1kd0023xpl6ayhm4816', 'cmndrx1ej000txpl6qndp3u9o', 'cmndrx1do000mxpl6jjrk0psx', '2026-03-30 22:42:35.437', '2026-03-30 22:42:35.437');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx1kq0025xpl6ifzownu5', 'cmndrx1ej000txpl6qndp3u9o', 'cmndrx1dr000nxpl66autecuy', '2026-03-30 22:42:35.45', '2026-03-30 22:42:35.45');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx1l00027xpl6gta8ki6v', 'cmndrx1ej000txpl6qndp3u9o', 'cmndrx1dv000oxpl6h812i6yp', '2026-03-30 22:42:35.46', '2026-03-30 22:42:35.46');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx1l80029xpl6aaqk6wjg', 'cmndrx1ej000txpl6qndp3u9o', 'cmndrx1dz000pxpl6xabhqxke', '2026-03-30 22:42:35.469', '2026-03-30 22:42:35.469');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx1lg002bxpl6gbezirim', 'cmndrx1ej000txpl6qndp3u9o', 'cmndrx1e3000qxpl6qvxu5970', '2026-03-30 22:42:35.476', '2026-03-30 22:42:35.476');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx1lt002dxpl6rzvkd50h', 'cmndrx1ej000txpl6qndp3u9o', 'cmndrx1e7000rxpl6wvezoy8c', '2026-03-30 22:42:35.489', '2026-03-30 22:42:35.489');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx1m5002fxpl6s0mrdg7z', 'cmndrx1ej000txpl6qndp3u9o', 'cmndrx1eb000sxpl6mggqk7s7', '2026-03-30 22:42:35.501', '2026-03-30 22:42:35.501');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx1wp0043xpl6oi026ncc', 'cmndrx1wl0041xpl6b8kfhqng', 'cmndrx1b70000xpl6jccigi0q', '2026-03-30 22:42:35.881', '2026-03-30 22:42:35.881');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx1wv0045xpl6c2qeafc2', 'cmndrx1wl0041xpl6b8kfhqng', 'cmndrx1bv0005xpl6vrg8iwbv', '2026-03-30 22:42:35.888', '2026-03-30 22:42:35.888');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx1x20047xpl6issk77q4', 'cmndrx1wl0041xpl6b8kfhqng', 'cmndrx1bz0006xpl608pa99r5', '2026-03-30 22:42:35.895', '2026-03-30 22:42:35.895');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx1xa0049xpl6sctepul3', 'cmndrx1wl0041xpl6b8kfhqng', 'cmndrx1c30007xpl6i83t4ffk', '2026-03-30 22:42:35.902', '2026-03-30 22:42:35.902');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx1xh004bxpl6ro22055y', 'cmndrx1wl0041xpl6b8kfhqng', 'cmndrx1c70008xpl6ai01tcxl', '2026-03-30 22:42:35.909', '2026-03-30 22:42:35.909');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx1xo004dxpl6vb0bwh53', 'cmndrx1wl0041xpl6b8kfhqng', 'cmndrx1cb0009xpl6t0zi9su3', '2026-03-30 22:42:35.916', '2026-03-30 22:42:35.916');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx1xu004fxpl6dcgcyu9k', 'cmndrx1wl0041xpl6b8kfhqng', 'cmndrx1cf000axpl65qtnzp9f', '2026-03-30 22:42:35.922', '2026-03-30 22:42:35.922');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx1y0004hxpl663crqgfd', 'cmndrx1wl0041xpl6b8kfhqng', 'cmndrx1cj000bxpl6r86rzy8x', '2026-03-30 22:42:35.929', '2026-03-30 22:42:35.929');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx1y6004jxpl6534d7265', 'cmndrx1wl0041xpl6b8kfhqng', 'cmndrx1cn000cxpl6ugq0a971', '2026-03-30 22:42:35.935', '2026-03-30 22:42:35.935');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx1ye004lxpl6ny7hvl4z', 'cmndrx1wl0041xpl6b8kfhqng', 'cmndrx1cr000dxpl6qqha1it0', '2026-03-30 22:42:35.943', '2026-03-30 22:42:35.943');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx1yl004nxpl66363u6sb', 'cmndrx1wl0041xpl6b8kfhqng', 'cmndrx1cv000expl6gl2fdmfx', '2026-03-30 22:42:35.95', '2026-03-30 22:42:35.95');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx1yt004pxpl63azzz9g1', 'cmndrx1wl0041xpl6b8kfhqng', 'cmndrx1d0000fxpl63dfm9pus', '2026-03-30 22:42:35.957', '2026-03-30 22:42:35.957');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx1z0004rxpl6liivb824', 'cmndrx1wl0041xpl6b8kfhqng', 'cmndrx1d3000gxpl6q7m2ps0y', '2026-03-30 22:42:35.964', '2026-03-30 22:42:35.964');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx1z7004txpl69zn8bn3a', 'cmndrx1wl0041xpl6b8kfhqng', 'cmndrx1d7000hxpl6p4sgwtgv', '2026-03-30 22:42:35.971', '2026-03-30 22:42:35.971');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx1ze004vxpl62sly61jv', 'cmndrx1wl0041xpl6b8kfhqng', 'cmndrx1da000ixpl6skph158a', '2026-03-30 22:42:35.978', '2026-03-30 22:42:35.978');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx1zo004yxpl6j1fv8rc1', 'cmndrx1zl004wxpl61rok9i7m', 'cmndrx1b70000xpl6jccigi0q', '2026-03-30 22:42:35.989', '2026-03-30 22:42:35.989');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx1zw0050xpl6w67xpqal', 'cmndrx1zl004wxpl61rok9i7m', 'cmndrx1bv0005xpl6vrg8iwbv', '2026-03-30 22:42:35.996', '2026-03-30 22:42:35.996');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx2030052xpl6ok71k7pp', 'cmndrx1zl004wxpl61rok9i7m', 'cmndrx1bz0006xpl608pa99r5', '2026-03-30 22:42:36.003', '2026-03-30 22:42:36.003');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx20a0054xpl6oaxait2r', 'cmndrx1zl004wxpl61rok9i7m', 'cmndrx1c30007xpl6i83t4ffk', '2026-03-30 22:42:36.011', '2026-03-30 22:42:36.011');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx20h0056xpl6qv7o64cw', 'cmndrx1zl004wxpl61rok9i7m', 'cmndrx1c70008xpl6ai01tcxl', '2026-03-30 22:42:36.017', '2026-03-30 22:42:36.017');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx20n0058xpl6njuvle97', 'cmndrx1zl004wxpl61rok9i7m', 'cmndrx1cb0009xpl6t0zi9su3', '2026-03-30 22:42:36.023', '2026-03-30 22:42:36.023');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx20t005axpl6r57wh608', 'cmndrx1zl004wxpl61rok9i7m', 'cmndrx1cf000axpl65qtnzp9f', '2026-03-30 22:42:36.029', '2026-03-30 22:42:36.029');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx210005cxpl65gfgbpjq', 'cmndrx1zl004wxpl61rok9i7m', 'cmndrx1cj000bxpl6r86rzy8x', '2026-03-30 22:42:36.036', '2026-03-30 22:42:36.036');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx218005expl6yks5qfp1', 'cmndrx1zl004wxpl61rok9i7m', 'cmndrx1cn000cxpl6ugq0a971', '2026-03-30 22:42:36.044', '2026-03-30 22:42:36.044');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx21f005gxpl63l9xp955', 'cmndrx1zl004wxpl61rok9i7m', 'cmndrx1dd000jxpl61qafwy17', '2026-03-30 22:42:36.051', '2026-03-30 22:42:36.051');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx21m005ixpl63ln0xzc5', 'cmndrx1zl004wxpl61rok9i7m', 'cmndrx1dh000kxpl6u4n3rleq', '2026-03-30 22:42:36.058', '2026-03-30 22:42:36.058');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx21u005kxpl6hih7y5h0', 'cmndrx1zl004wxpl61rok9i7m', 'cmndrx1dk000lxpl6wy8uuv3a', '2026-03-30 22:42:36.066', '2026-03-30 22:42:36.066');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndrx221005mxpl6k3zjcsio', 'cmndrx1zl004wxpl61rok9i7m', 'cmndrx1do000mxpl6jjrk0psx', '2026-03-30 22:42:36.073', '2026-03-30 22:42:36.073');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmnds2mr9003qyzzkfrigwzza', 'cmndrx1ej000txpl6qndp3u9o', 'cmnds00rp0002yzzkebdjsz39', '2026-03-30 22:46:56.172', '2026-03-30 22:46:56.172');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmnds2msd003syzzk7tkusvje', 'cmndrx1ej000txpl6qndp3u9o', 'cmnds00tb0005yzzkf6wa5kra', '2026-03-30 22:46:56.199', '2026-03-30 22:46:56.199');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmnds2mtq003wyzzkiv1aqpgi', 'cmndrx1ej000txpl6qndp3u9o', 'cmnds00vi0008yzzk00nxraxn', '2026-03-30 22:46:56.271', '2026-03-30 22:46:56.271');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmnds2mtl003uyzzk9kxlvo4w', 'cmndrx1ej000txpl6qndp3u9o', 'cmnds00t30004yzzkuth4mfti', '2026-03-30 22:46:56.255', '2026-03-30 22:46:56.255');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmnds2mxu0040yzzk6k4onhrj', 'cmndrx1ej000txpl6qndp3u9o', 'cmnds00wq000ayzzk0qaf0grf', '2026-03-30 22:46:56.318', '2026-03-30 22:46:56.318');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmnds2mxt003yyzzkhxq5h77z', 'cmndrx1ej000txpl6qndp3u9o', 'cmnds00sg0003yzzk9z7kham2', '2026-03-30 22:46:56.265', '2026-03-30 22:46:56.265');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") VALUES ('cmndvmcvo0017zv1y16bcye0y', 'cmndrx1ej000txpl6qndp3u9o', 'cmndvm3rc0004zv1yic8z4jt8', '2026-03-31 00:26:15.346', '2026-03-31 00:26:15.346');


--
-- Data for Name: SaleItem; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: SaleReturn; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: SaleReturnItem; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: Service; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Service" (id, name, active, "createdAt", "updatedAt", "commissionType", "commissionValue", "descriptionShort", "estimatedTimeMin", "internalCode", "marketplaceCategoryId", "marketplaceDescTemplate", "marketplaceTitleTemplate", "priceBase", "priceType", "warrantyMonths") VALUES ('cmndrx2lq008fxpl6w6niczts', 'Diagnóstico básico de desktop', true, '2026-03-30 22:42:36.783', '2026-03-30 22:42:36.783', 'PERCENT', 0.00, 'Diagnóstico básico de desktop', NULL, 'SRV-0001', NULL, NULL, NULL, 60.00, 'FIXED', NULL);
INSERT INTO public."Service" (id, name, active, "createdAt", "updatedAt", "commissionType", "commissionValue", "descriptionShort", "estimatedTimeMin", "internalCode", "marketplaceCategoryId", "marketplaceDescTemplate", "marketplaceTitleTemplate", "priceBase", "priceType", "warrantyMonths") VALUES ('cmndrx2lw008gxpl6ri2q6i25', 'Diagnóstico básico de notebook', true, '2026-03-30 22:42:36.788', '2026-03-30 22:42:36.788', 'PERCENT', 0.00, 'Diagnóstico básico de notebook', NULL, 'SRV-0002', NULL, NULL, NULL, 70.00, 'FIXED', NULL);
INSERT INTO public."Service" (id, name, active, "createdAt", "updatedAt", "commissionType", "commissionValue", "descriptionShort", "estimatedTimeMin", "internalCode", "marketplaceCategoryId", "marketplaceDescTemplate", "marketplaceTitleTemplate", "priceBase", "priceType", "warrantyMonths") VALUES ('cmndrx2m0008hxpl6rcwcroco', 'Diagnóstico avançado de hardware', true, '2026-03-30 22:42:36.792', '2026-03-30 22:42:36.792', 'PERCENT', 0.00, 'Diagnóstico avançado de hardware', NULL, 'SRV-0003', NULL, NULL, NULL, 120.00, 'FIXED', NULL);
INSERT INTO public."Service" (id, name, active, "createdAt", "updatedAt", "commissionType", "commissionValue", "descriptionShort", "estimatedTimeMin", "internalCode", "marketplaceCategoryId", "marketplaceDescTemplate", "marketplaceTitleTemplate", "priceBase", "priceType", "warrantyMonths") VALUES ('cmndrx2m3008ixpl6dipo2bf9', 'Formatação de desktop sem backup', true, '2026-03-30 22:42:36.795', '2026-03-30 22:42:36.795', 'PERCENT', 0.00, 'Formatação de desktop sem backup', NULL, 'SRV-0004', NULL, NULL, NULL, 100.00, 'FIXED', NULL);
INSERT INTO public."Service" (id, name, active, "createdAt", "updatedAt", "commissionType", "commissionValue", "descriptionShort", "estimatedTimeMin", "internalCode", "marketplaceCategoryId", "marketplaceDescTemplate", "marketplaceTitleTemplate", "priceBase", "priceType", "warrantyMonths") VALUES ('cmndrx2m6008jxpl6xftcmhf2', 'Formatação de notebook sem backup', true, '2026-03-30 22:42:36.799', '2026-03-30 22:42:36.799', 'PERCENT', 0.00, 'Formatação de notebook sem backup', NULL, 'SRV-0005', NULL, NULL, NULL, 100.00, 'FIXED', NULL);
INSERT INTO public."Service" (id, name, active, "createdAt", "updatedAt", "commissionType", "commissionValue", "descriptionShort", "estimatedTimeMin", "internalCode", "marketplaceCategoryId", "marketplaceDescTemplate", "marketplaceTitleTemplate", "priceBase", "priceType", "warrantyMonths") VALUES ('cmndrx2ma008kxpl6s1dzku38', 'Reinstalação de Windows com drivers', true, '2026-03-30 22:42:36.802', '2026-03-30 22:42:36.802', 'PERCENT', 0.00, 'Reinstalação de Windows com drivers', NULL, 'SRV-0006', NULL, NULL, NULL, 150.00, 'FIXED', NULL);
INSERT INTO public."Service" (id, name, active, "createdAt", "updatedAt", "commissionType", "commissionValue", "descriptionShort", "estimatedTimeMin", "internalCode", "marketplaceCategoryId", "marketplaceDescTemplate", "marketplaceTitleTemplate", "priceBase", "priceType", "warrantyMonths") VALUES ('cmndrx2me008lxpl6idac4sb6', 'Instalação de distribuição Linux', true, '2026-03-30 22:42:36.806', '2026-03-30 22:42:36.806', 'PERCENT', 0.00, 'Instalação de distribuição Linux', NULL, 'SRV-0007', NULL, NULL, NULL, 150.00, 'FIXED', NULL);
INSERT INTO public."Service" (id, name, active, "createdAt", "updatedAt", "commissionType", "commissionValue", "descriptionShort", "estimatedTimeMin", "internalCode", "marketplaceCategoryId", "marketplaceDescTemplate", "marketplaceTitleTemplate", "priceBase", "priceType", "warrantyMonths") VALUES ('cmndrx2mh008mxpl68qjmt9yr', 'Limpeza de vírus e malware', true, '2026-03-30 22:42:36.809', '2026-03-30 22:42:36.809', 'PERCENT', 0.00, 'Limpeza de vírus e malware', NULL, 'SRV-0008', NULL, NULL, NULL, 120.00, 'FIXED', NULL);
INSERT INTO public."Service" (id, name, active, "createdAt", "updatedAt", "commissionType", "commissionValue", "descriptionShort", "estimatedTimeMin", "internalCode", "marketplaceCategoryId", "marketplaceDescTemplate", "marketplaceTitleTemplate", "priceBase", "priceType", "warrantyMonths") VALUES ('cmndrx2mk008nxpl617fde4of', 'Otimização de sistema', true, '2026-03-30 22:42:36.812', '2026-03-30 22:42:36.812', 'PERCENT', 0.00, 'Otimização de sistema', NULL, 'SRV-0009', NULL, NULL, NULL, 100.00, 'FIXED', NULL);
INSERT INTO public."Service" (id, name, active, "createdAt", "updatedAt", "commissionType", "commissionValue", "descriptionShort", "estimatedTimeMin", "internalCode", "marketplaceCategoryId", "marketplaceDescTemplate", "marketplaceTitleTemplate", "priceBase", "priceType", "warrantyMonths") VALUES ('cmndrx2mn008oxpl6bfkvu205', 'Limpeza interna completa de desktop', true, '2026-03-30 22:42:36.816', '2026-03-30 22:42:36.816', 'PERCENT', 0.00, 'Limpeza interna completa de desktop', NULL, 'SRV-0010', NULL, NULL, NULL, 80.00, 'FIXED', NULL);
INSERT INTO public."Service" (id, name, active, "createdAt", "updatedAt", "commissionType", "commissionValue", "descriptionShort", "estimatedTimeMin", "internalCode", "marketplaceCategoryId", "marketplaceDescTemplate", "marketplaceTitleTemplate", "priceBase", "priceType", "warrantyMonths") VALUES ('cmndrx2mq008pxpl6otjzj23p', 'Limpeza interna completa de notebook', true, '2026-03-30 22:42:36.819', '2026-03-30 22:42:36.819', 'PERCENT', 0.00, 'Limpeza interna completa de notebook', NULL, 'SRV-0011', NULL, NULL, NULL, 120.00, 'FIXED', NULL);
INSERT INTO public."Service" (id, name, active, "createdAt", "updatedAt", "commissionType", "commissionValue", "descriptionShort", "estimatedTimeMin", "internalCode", "marketplaceCategoryId", "marketplaceDescTemplate", "marketplaceTitleTemplate", "priceBase", "priceType", "warrantyMonths") VALUES ('cmndrx2mu008qxpl6dapeavb3', 'Troca de pasta térmica desktop', true, '2026-03-30 22:42:36.822', '2026-03-30 22:42:36.822', 'PERCENT', 0.00, 'Troca de pasta térmica desktop', NULL, 'SRV-0012', NULL, NULL, NULL, 80.00, 'FIXED', NULL);
INSERT INTO public."Service" (id, name, active, "createdAt", "updatedAt", "commissionType", "commissionValue", "descriptionShort", "estimatedTimeMin", "internalCode", "marketplaceCategoryId", "marketplaceDescTemplate", "marketplaceTitleTemplate", "priceBase", "priceType", "warrantyMonths") VALUES ('cmndrx2mx008rxpl6hr4qs2na', 'Troca de pasta térmica notebook', true, '2026-03-30 22:42:36.825', '2026-03-30 22:42:36.825', 'PERCENT', 0.00, 'Troca de pasta térmica notebook', NULL, 'SRV-0013', NULL, NULL, NULL, 120.00, 'FIXED', NULL);
INSERT INTO public."Service" (id, name, active, "createdAt", "updatedAt", "commissionType", "commissionValue", "descriptionShort", "estimatedTimeMin", "internalCode", "marketplaceCategoryId", "marketplaceDescTemplate", "marketplaceTitleTemplate", "priceBase", "priceType", "warrantyMonths") VALUES ('cmndrx2n0008sxpl6k48juhea', 'Instalação de memória RAM em desktop', true, '2026-03-30 22:42:36.828', '2026-03-30 22:42:36.828', 'PERCENT', 0.00, 'Instalação de memória RAM em desktop', NULL, 'SRV-0014', NULL, NULL, NULL, 60.00, 'FIXED', NULL);
INSERT INTO public."Service" (id, name, active, "createdAt", "updatedAt", "commissionType", "commissionValue", "descriptionShort", "estimatedTimeMin", "internalCode", "marketplaceCategoryId", "marketplaceDescTemplate", "marketplaceTitleTemplate", "priceBase", "priceType", "warrantyMonths") VALUES ('cmndrx2n3008txpl6cmrs67ow', 'Instalação de memória RAM em notebook', true, '2026-03-30 22:42:36.831', '2026-03-30 22:42:36.831', 'PERCENT', 0.00, 'Instalação de memória RAM em notebook', NULL, 'SRV-0015', NULL, NULL, NULL, 80.00, 'FIXED', NULL);
INSERT INTO public."Service" (id, name, active, "createdAt", "updatedAt", "commissionType", "commissionValue", "descriptionShort", "estimatedTimeMin", "internalCode", "marketplaceCategoryId", "marketplaceDescTemplate", "marketplaceTitleTemplate", "priceBase", "priceType", "warrantyMonths") VALUES ('cmndrx2n6008uxpl60o9md8ld', 'Instalação de SSD com clonagem', true, '2026-03-30 22:42:36.834', '2026-03-30 22:42:36.834', 'PERCENT', 0.00, 'Instalação de SSD com clonagem', NULL, 'SRV-0016', NULL, NULL, NULL, 200.00, 'FIXED', NULL);
INSERT INTO public."Service" (id, name, active, "createdAt", "updatedAt", "commissionType", "commissionValue", "descriptionShort", "estimatedTimeMin", "internalCode", "marketplaceCategoryId", "marketplaceDescTemplate", "marketplaceTitleTemplate", "priceBase", "priceType", "warrantyMonths") VALUES ('cmndrx2n9008vxpl6qzt75d4b', 'Instalação de placa de vídeo dedicada', true, '2026-03-30 22:42:36.838', '2026-03-30 22:42:36.838', 'PERCENT', 0.00, 'Instalação de placa de vídeo dedicada', NULL, 'SRV-0017', NULL, NULL, NULL, 120.00, 'FIXED', NULL);
INSERT INTO public."Service" (id, name, active, "createdAt", "updatedAt", "commissionType", "commissionValue", "descriptionShort", "estimatedTimeMin", "internalCode", "marketplaceCategoryId", "marketplaceDescTemplate", "marketplaceTitleTemplate", "priceBase", "priceType", "warrantyMonths") VALUES ('cmndrx2nc008wxpl6eypvrhho', 'Instalação de kit placa-mãe/CPU/RAM', true, '2026-03-30 22:42:36.841', '2026-03-30 22:42:36.841', 'PERCENT', 0.00, 'Instalação de kit placa-mãe/CPU/RAM', NULL, 'SRV-0018', NULL, NULL, NULL, 150.00, 'FIXED', NULL);
INSERT INTO public."Service" (id, name, active, "createdAt", "updatedAt", "commissionType", "commissionValue", "descriptionShort", "estimatedTimeMin", "internalCode", "marketplaceCategoryId", "marketplaceDescTemplate", "marketplaceTitleTemplate", "priceBase", "priceType", "warrantyMonths") VALUES ('cmndrx2ng008xxpl6lqwf8vbx', 'Troca de tela de smartphone', true, '2026-03-30 22:42:36.844', '2026-03-30 22:42:36.844', 'PERCENT', 0.00, 'Troca de tela de smartphone', NULL, 'SRV-0019', NULL, NULL, NULL, 850.00, 'FIXED', NULL);
INSERT INTO public."Service" (id, name, active, "createdAt", "updatedAt", "commissionType", "commissionValue", "descriptionShort", "estimatedTimeMin", "internalCode", "marketplaceCategoryId", "marketplaceDescTemplate", "marketplaceTitleTemplate", "priceBase", "priceType", "warrantyMonths") VALUES ('cmndrx2nj008yxpl60xd8uo9k', 'Troca de bateria de smartphone', true, '2026-03-30 22:42:36.847', '2026-03-30 22:42:36.847', 'PERCENT', 0.00, 'Troca de bateria de smartphone', NULL, 'SRV-0020', NULL, NULL, NULL, 180.00, 'FIXED', NULL);
INSERT INTO public."Service" (id, name, active, "createdAt", "updatedAt", "commissionType", "commissionValue", "descriptionShort", "estimatedTimeMin", "internalCode", "marketplaceCategoryId", "marketplaceDescTemplate", "marketplaceTitleTemplate", "priceBase", "priceType", "warrantyMonths") VALUES ('cmndrx2nm008zxpl6k8t75rx2', 'Troca de conector de carga smartphone', true, '2026-03-30 22:42:36.85', '2026-03-30 22:42:36.85', 'PERCENT', 0.00, 'Troca de conector de carga smartphone', NULL, 'SRV-0021', NULL, NULL, NULL, 150.00, 'FIXED', NULL);
INSERT INTO public."Service" (id, name, active, "createdAt", "updatedAt", "commissionType", "commissionValue", "descriptionShort", "estimatedTimeMin", "internalCode", "marketplaceCategoryId", "marketplaceDescTemplate", "marketplaceTitleTemplate", "priceBase", "priceType", "warrantyMonths") VALUES ('cmndrx2np0090xpl66xy5ryb1', 'Reparo em botão power smartphone', true, '2026-03-30 22:42:36.854', '2026-03-30 22:42:36.854', 'PERCENT', 0.00, 'Reparo em botão power smartphone', NULL, 'SRV-0022', NULL, NULL, NULL, 150.00, 'FIXED', NULL);
INSERT INTO public."Service" (id, name, active, "createdAt", "updatedAt", "commissionType", "commissionValue", "descriptionShort", "estimatedTimeMin", "internalCode", "marketplaceCategoryId", "marketplaceDescTemplate", "marketplaceTitleTemplate", "priceBase", "priceType", "warrantyMonths") VALUES ('cmndrx2ns0091xpl6uizga83z', 'Desoxidação de placa smartphone', true, '2026-03-30 22:42:36.857', '2026-03-30 22:42:36.857', 'PERCENT', 0.00, 'Desoxidação de placa smartphone', NULL, 'SRV-0023', NULL, NULL, NULL, 250.00, 'FIXED', NULL);
INSERT INTO public."Service" (id, name, active, "createdAt", "updatedAt", "commissionType", "commissionValue", "descriptionShort", "estimatedTimeMin", "internalCode", "marketplaceCategoryId", "marketplaceDescTemplate", "marketplaceTitleTemplate", "priceBase", "priceType", "warrantyMonths") VALUES ('cmndrx2nw0092xpl6f6oysrkg', 'Diagnóstico de console de videogame', true, '2026-03-30 22:42:36.86', '2026-03-30 22:42:36.86', 'PERCENT', 0.00, 'Diagnóstico de console de videogame', NULL, 'SRV-0024', NULL, NULL, NULL, 120.00, 'FIXED', NULL);
INSERT INTO public."Service" (id, name, active, "createdAt", "updatedAt", "commissionType", "commissionValue", "descriptionShort", "estimatedTimeMin", "internalCode", "marketplaceCategoryId", "marketplaceDescTemplate", "marketplaceTitleTemplate", "priceBase", "priceType", "warrantyMonths") VALUES ('cmndrx2nz0093xpl6kejpnll4', 'Limpeza interna de console', true, '2026-03-30 22:42:36.863', '2026-03-30 22:42:36.863', 'PERCENT', 0.00, 'Limpeza interna de console', NULL, 'SRV-0025', NULL, NULL, NULL, 150.00, 'FIXED', NULL);
INSERT INTO public."Service" (id, name, active, "createdAt", "updatedAt", "commissionType", "commissionValue", "descriptionShort", "estimatedTimeMin", "internalCode", "marketplaceCategoryId", "marketplaceDescTemplate", "marketplaceTitleTemplate", "priceBase", "priceType", "warrantyMonths") VALUES ('cmndrx2o20094xpl6qn24gvlg', 'Troca de pasta térmica de console', true, '2026-03-30 22:42:36.866', '2026-03-30 22:42:36.866', 'PERCENT', 0.00, 'Troca de pasta térmica de console', NULL, 'SRV-0026', NULL, NULL, NULL, 150.00, 'FIXED', NULL);
INSERT INTO public."Service" (id, name, active, "createdAt", "updatedAt", "commissionType", "commissionValue", "descriptionShort", "estimatedTimeMin", "internalCode", "marketplaceCategoryId", "marketplaceDescTemplate", "marketplaceTitleTemplate", "priceBase", "priceType", "warrantyMonths") VALUES ('cmndrx2o50095xpl664jr9d5o', 'Reparo em porta HDMI de console', true, '2026-03-30 22:42:36.87', '2026-03-30 22:42:36.87', 'PERCENT', 0.00, 'Reparo em porta HDMI de console', NULL, 'SRV-0027', NULL, NULL, NULL, 300.00, 'FIXED', NULL);
INSERT INTO public."Service" (id, name, active, "createdAt", "updatedAt", "commissionType", "commissionValue", "descriptionShort", "estimatedTimeMin", "internalCode", "marketplaceCategoryId", "marketplaceDescTemplate", "marketplaceTitleTemplate", "priceBase", "priceType", "warrantyMonths") VALUES ('cmndrx2o80096xpl62pio07qp', 'Troca de HD por SSD em console', true, '2026-03-30 22:42:36.873', '2026-03-30 22:42:36.873', 'PERCENT', 0.00, 'Troca de HD por SSD em console', NULL, 'SRV-0028', NULL, NULL, NULL, 250.00, 'FIXED', NULL);
INSERT INTO public."Service" (id, name, active, "createdAt", "updatedAt", "commissionType", "commissionValue", "descriptionShort", "estimatedTimeMin", "internalCode", "marketplaceCategoryId", "marketplaceDescTemplate", "marketplaceTitleTemplate", "priceBase", "priceType", "warrantyMonths") VALUES ('cmndrx2oc0097xpl6sgq0fs5i', 'Reparo drift analógico controle', true, '2026-03-30 22:42:36.876', '2026-03-30 22:42:36.876', 'PERCENT', 0.00, 'Reparo drift analógico controle', NULL, 'SRV-0029', NULL, NULL, NULL, 120.00, 'FIXED', NULL);
INSERT INTO public."Service" (id, name, active, "createdAt", "updatedAt", "commissionType", "commissionValue", "descriptionShort", "estimatedTimeMin", "internalCode", "marketplaceCategoryId", "marketplaceDescTemplate", "marketplaceTitleTemplate", "priceBase", "priceType", "warrantyMonths") VALUES ('cmndrx2of0098xpl6y823e6di', 'Troca de carcaça de controle', true, '2026-03-30 22:42:36.879', '2026-03-30 22:42:36.879', 'PERCENT', 0.00, 'Troca de carcaça de controle', NULL, 'SRV-0030', NULL, NULL, NULL, 150.00, 'FIXED', NULL);
INSERT INTO public."Service" (id, name, active, "createdAt", "updatedAt", "commissionType", "commissionValue", "descriptionShort", "estimatedTimeMin", "internalCode", "marketplaceCategoryId", "marketplaceDescTemplate", "marketplaceTitleTemplate", "priceBase", "priceType", "warrantyMonths") VALUES ('cmndrx2oi0099xpl62b2d87hp', 'Configuração de rede Wi-Fi', true, '2026-03-30 22:42:36.882', '2026-03-30 22:42:36.882', 'PERCENT', 0.00, 'Configuração de rede Wi-Fi', NULL, 'SRV-0031', NULL, NULL, NULL, 100.00, 'FIXED', NULL);
INSERT INTO public."Service" (id, name, active, "createdAt", "updatedAt", "commissionType", "commissionValue", "descriptionShort", "estimatedTimeMin", "internalCode", "marketplaceCategoryId", "marketplaceDescTemplate", "marketplaceTitleTemplate", "priceBase", "priceType", "warrantyMonths") VALUES ('cmndrx2ol009axpl62qcl1c8k', 'Configuração de roteador avançado', true, '2026-03-30 22:42:36.885', '2026-03-30 22:42:36.885', 'PERCENT', 0.00, 'Configuração de roteador avançado', NULL, 'SRV-0032', NULL, NULL, NULL, 120.00, 'FIXED', NULL);
INSERT INTO public."Service" (id, name, active, "createdAt", "updatedAt", "commissionType", "commissionValue", "descriptionShort", "estimatedTimeMin", "internalCode", "marketplaceCategoryId", "marketplaceDescTemplate", "marketplaceTitleTemplate", "priceBase", "priceType", "warrantyMonths") VALUES ('cmndrx2op009bxpl6lhau2q1i', 'Instalação e configuração de impressora', true, '2026-03-30 22:42:36.889', '2026-03-30 22:42:36.889', 'PERCENT', 0.00, 'Instalação e configuração de impressora', NULL, 'SRV-0033', NULL, NULL, NULL, 80.00, 'FIXED', NULL);
INSERT INTO public."Service" (id, name, active, "createdAt", "updatedAt", "commissionType", "commissionValue", "descriptionShort", "estimatedTimeMin", "internalCode", "marketplaceCategoryId", "marketplaceDescTemplate", "marketplaceTitleTemplate", "priceBase", "priceType", "warrantyMonths") VALUES ('cmndrx2os009cxpl6o4rgoaw8', 'Suporte remoto por hora', true, '2026-03-30 22:42:36.893', '2026-03-30 22:42:36.893', 'PERCENT', 0.00, 'Suporte remoto por hora', NULL, 'SRV-0034', NULL, NULL, NULL, 80.00, 'FIXED', NULL);
INSERT INTO public."Service" (id, name, active, "createdAt", "updatedAt", "commissionType", "commissionValue", "descriptionShort", "estimatedTimeMin", "internalCode", "marketplaceCategoryId", "marketplaceDescTemplate", "marketplaceTitleTemplate", "priceBase", "priceType", "warrantyMonths") VALUES ('cmndrx2ov009dxpl6li1tmgbm', 'Atendimento técnico presencial por hora', true, '2026-03-30 22:42:36.896', '2026-03-30 22:42:36.896', 'PERCENT', 0.00, 'Atendimento técnico presencial por hora', NULL, 'SRV-0035', NULL, NULL, NULL, 150.00, 'FIXED', NULL);
INSERT INTO public."Service" (id, name, active, "createdAt", "updatedAt", "commissionType", "commissionValue", "descriptionShort", "estimatedTimeMin", "internalCode", "marketplaceCategoryId", "marketplaceDescTemplate", "marketplaceTitleTemplate", "priceBase", "priceType", "warrantyMonths") VALUES ('cmndrx2p0009expl6u9t8ygrp', 'Recuperação de dados em HD', true, '2026-03-30 22:42:36.9', '2026-03-30 22:42:36.9', 'PERCENT', 0.00, 'Recuperação de dados em HD', NULL, 'SRV-0036', NULL, NULL, NULL, 300.00, 'FIXED', NULL);
INSERT INTO public."Service" (id, name, active, "createdAt", "updatedAt", "commissionType", "commissionValue", "descriptionShort", "estimatedTimeMin", "internalCode", "marketplaceCategoryId", "marketplaceDescTemplate", "marketplaceTitleTemplate", "priceBase", "priceType", "warrantyMonths") VALUES ('cmndrx2p4009fxpl6vytq0o62', 'Reballing de GPU/CPU', true, '2026-03-30 22:42:36.904', '2026-03-30 22:42:36.904', 'PERCENT', 0.00, 'Reballing de GPU/CPU', NULL, 'SRV-0037', NULL, NULL, NULL, 600.00, 'FIXED', NULL);
INSERT INTO public."Service" (id, name, active, "createdAt", "updatedAt", "commissionType", "commissionValue", "descriptionShort", "estimatedTimeMin", "internalCode", "marketplaceCategoryId", "marketplaceDescTemplate", "marketplaceTitleTemplate", "priceBase", "priceType", "warrantyMonths") VALUES ('cmndrx2p8009gxpl6iozcbyze', 'Formatação Playstation', true, '2026-03-30 22:42:36.909', '2026-03-30 22:42:36.909', 'PERCENT', 0.00, 'Formatação Playstation', NULL, 'SRV-0038', NULL, NULL, NULL, 100.00, 'FIXED', NULL);
INSERT INTO public."Service" (id, name, active, "createdAt", "updatedAt", "commissionType", "commissionValue", "descriptionShort", "estimatedTimeMin", "internalCode", "marketplaceCategoryId", "marketplaceDescTemplate", "marketplaceTitleTemplate", "priceBase", "priceType", "warrantyMonths") VALUES ('cmndrx2pc009hxpl6lyi8m5t9', 'Troca de HD PS4', true, '2026-03-30 22:42:36.912', '2026-03-30 22:42:36.912', 'PERCENT', 0.00, 'Troca de HD PS4', NULL, 'SRV-0039', NULL, NULL, NULL, 150.00, 'FIXED', NULL);
INSERT INTO public."Service" (id, name, active, "createdAt", "updatedAt", "commissionType", "commissionValue", "descriptionShort", "estimatedTimeMin", "internalCode", "marketplaceCategoryId", "marketplaceDescTemplate", "marketplaceTitleTemplate", "priceBase", "priceType", "warrantyMonths") VALUES ('cmndrx2pf009ixpl6z8mhsgrg', 'Upgrade SSD PS5', true, '2026-03-30 22:42:36.915', '2026-03-30 22:42:36.915', 'PERCENT', 0.00, 'Upgrade SSD PS5', NULL, 'SRV-0040', NULL, NULL, NULL, 100.00, 'FIXED', NULL);
INSERT INTO public."Service" (id, name, active, "createdAt", "updatedAt", "commissionType", "commissionValue", "descriptionShort", "estimatedTimeMin", "internalCode", "marketplaceCategoryId", "marketplaceDescTemplate", "marketplaceTitleTemplate", "priceBase", "priceType", "warrantyMonths") VALUES ('cmndrx2pi009jxpl6gb5ihu4m', 'Limpeza interna console', true, '2026-03-30 22:42:36.919', '2026-03-30 22:42:36.919', 'PERCENT', 0.00, 'Limpeza interna console', NULL, 'SRV-0041', NULL, NULL, NULL, 150.00, 'FIXED', NULL);
INSERT INTO public."Service" (id, name, active, "createdAt", "updatedAt", "commissionType", "commissionValue", "descriptionShort", "estimatedTimeMin", "internalCode", "marketplaceCategoryId", "marketplaceDescTemplate", "marketplaceTitleTemplate", "priceBase", "priceType", "warrantyMonths") VALUES ('cmndrx2pm009kxpl64r8xcuje', 'Instalação de jogo digital', true, '2026-03-30 22:42:36.922', '2026-03-30 22:42:36.922', 'PERCENT', 0.00, 'Instalação de jogo digital', NULL, 'SRV-0042', NULL, NULL, NULL, 50.00, 'FIXED', NULL);
INSERT INTO public."Service" (id, name, active, "createdAt", "updatedAt", "commissionType", "commissionValue", "descriptionShort", "estimatedTimeMin", "internalCode", "marketplaceCategoryId", "marketplaceDescTemplate", "marketplaceTitleTemplate", "priceBase", "priceType", "warrantyMonths") VALUES ('cmndrx2pp009lxpl6uds0jmur', 'Atualização de sistema', true, '2026-03-30 22:42:36.926', '2026-03-30 22:42:36.926', 'PERCENT', 0.00, 'Atualização de sistema', NULL, 'SRV-0043', NULL, NULL, NULL, 80.00, 'FIXED', NULL);
INSERT INTO public."Service" (id, name, active, "createdAt", "updatedAt", "commissionType", "commissionValue", "descriptionShort", "estimatedTimeMin", "internalCode", "marketplaceCategoryId", "marketplaceDescTemplate", "marketplaceTitleTemplate", "priceBase", "priceType", "warrantyMonths") VALUES ('cmndrx2ps009mxpl6mruqvd28', 'Manutenção controle', true, '2026-03-30 22:42:36.929', '2026-03-30 22:42:36.929', 'PERCENT', 0.00, 'Manutenção controle', NULL, 'SRV-0044', NULL, NULL, NULL, 80.00, 'FIXED', NULL);
INSERT INTO public."Service" (id, name, active, "createdAt", "updatedAt", "commissionType", "commissionValue", "descriptionShort", "estimatedTimeMin", "internalCode", "marketplaceCategoryId", "marketplaceDescTemplate", "marketplaceTitleTemplate", "priceBase", "priceType", "warrantyMonths") VALUES ('cmndrx2pv009nxpl6u5a1vvkf', 'Troca de analógico controle', true, '2026-03-30 22:42:36.932', '2026-03-30 22:42:36.932', 'PERCENT', 0.00, 'Troca de analógico controle', NULL, 'SRV-0045', NULL, NULL, NULL, 120.00, 'FIXED', NULL);


--
-- Data for Name: ServiceCommissionProvision; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: ServiceOrderHistory; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: ServiceOrderItem; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: Stock; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: StockMovement; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: StoreSettings; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."StoreSettings" (id, "nameFantasia", cnpj, address, phone, email, "serviceHours", "updatedAt") VALUES ('cmndryw8t0000yzzkyt7lamup', 'Virtual Games', '00.000.000/0001-00', 'Rua Venâncio Aires, 1434, Torre Divindade. Sala 106 D-2, Centro, Santa Maria, RS - CEP 97010-002', '(55) 99725-2786', 'contato@virtualgames.com', 'Segunda a Sexta: 09:00 às 18:30 | Sábado: 09:00 às 13:00', '2026-03-30 22:44:01.853');
INSERT INTO public."StoreSettings" (id, "nameFantasia", cnpj, address, phone, email, "serviceHours", "updatedAt") VALUES ('fc01d690-0d60-4e91-80b2-b8f9a8e08cde', 'Virtual Games', '00.000.000/0001-00', 'Rua Venancio Aires 1434 Torre Divindade Sala 106 D-2 Centro Santa Maria RS CEP 97010-002', '(55) 99725-2786', 'contato@virtualgames.com', 'Segunda a Sexta 09h as 18h30 | Sabado 09h as 13h', '2026-03-30 23:57:14.422');


--
-- Data for Name: Subcategory; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Subcategory" (id, "categoryId", name, slug, description, active, "createdAt", "updatedAt") VALUES ('cmndrx2cu0062xpl6c6lgp5ph', 'cmndrx2cp0060xpl69fqhprbq', 'Console', 'console', 'Categoria consolidada Console', true, '2026-03-30 22:42:36.463', '2026-03-30 22:42:36.463');
INSERT INTO public."Subcategory" (id, "categoryId", name, slug, description, active, "createdAt", "updatedAt") VALUES ('cmndrx2d30065xpl6r70v0274', 'cmndrx2cz0063xpl6g8j5nn4x', 'Jogo', 'jogo', 'Categoria consolidada Jogo', true, '2026-03-30 22:42:36.471', '2026-03-30 22:42:36.471');
INSERT INTO public."Subcategory" (id, "categoryId", name, slug, description, active, "createdAt", "updatedAt") VALUES ('cmndrx2d90068xpl6y0t4bek5', 'cmndrx2d60066xpl6nc7btcxn', 'Computador', 'computador', 'Categoria consolidada Computador', true, '2026-03-30 22:42:36.478', '2026-03-30 22:42:36.478');
INSERT INTO public."Subcategory" (id, "categoryId", name, slug, description, active, "createdAt", "updatedAt") VALUES ('cmndrx2dg006bxpl60b81fhrf', 'cmndrx2dd0069xpl6ddqh77tl', 'Placa', 'placa', 'Categoria consolidada Placa', true, '2026-03-30 22:42:36.484', '2026-03-30 22:42:36.484');
INSERT INTO public."Subcategory" (id, "categoryId", name, slug, description, active, "createdAt", "updatedAt") VALUES ('cmndrx2dn006expl6zylyi3q3', 'cmndrx2dk006cxpl6rtdo5nnt', 'Hardware', 'hardware', 'Categoria consolidada Hardware', true, '2026-03-30 22:42:36.491', '2026-03-30 22:42:36.491');
INSERT INTO public."Subcategory" (id, "categoryId", name, slug, description, active, "createdAt", "updatedAt") VALUES ('cmndrx2du006hxpl64io79jww', 'cmndrx2dr006fxpl6inufoqdt', 'Periférico', 'periferico', 'Categoria consolidada Periférico', true, '2026-03-30 22:42:36.498', '2026-03-30 22:42:36.498');
INSERT INTO public."Subcategory" (id, "categoryId", name, slug, description, active, "createdAt", "updatedAt") VALUES ('cmndrx2e1006kxpl6qf46h1an', 'cmndrx2dx006ixpl6vsx8qxdb', 'Smartphone', 'smartphone', 'Categoria consolidada Smartphone', true, '2026-03-30 22:42:36.506', '2026-03-30 22:42:36.506');
INSERT INTO public."Subcategory" (id, "categoryId", name, slug, description, active, "createdAt", "updatedAt") VALUES ('cmndrx2e8006nxpl6x6okcevi', 'cmndrx2e5006lxpl613j3lba5', 'Tablet', 'tablet', 'Categoria consolidada Tablet', true, '2026-03-30 22:42:36.512', '2026-03-30 22:42:36.512');
INSERT INTO public."Subcategory" (id, "categoryId", name, slug, description, active, "createdAt", "updatedAt") VALUES ('cmndrx2ee006qxpl6yshsb9rt', 'cmndrx2eb006oxpl6v9f1vglh', 'Wearable', 'wearable', 'Categoria consolidada Wearable', true, '2026-03-30 22:42:36.519', '2026-03-30 22:42:36.519');
INSERT INTO public."Subcategory" (id, "categoryId", name, slug, description, active, "createdAt", "updatedAt") VALUES ('cmndrx2el006txpl66ciidmzl', 'cmndrx2ei006rxpl6mxknd5s9', 'Televisor', 'televisor', 'Categoria consolidada Televisor', true, '2026-03-30 22:42:36.526', '2026-03-30 22:42:36.526');
INSERT INTO public."Subcategory" (id, "categoryId", name, slug, description, active, "createdAt", "updatedAt") VALUES ('cmndrx2es006wxpl6uzvv4db5', 'cmndrx2eo006uxpl61ofifoig', 'Monitor', 'monitor', 'Categoria consolidada Monitor', true, '2026-03-30 22:42:36.532', '2026-03-30 22:42:36.532');
INSERT INTO public."Subcategory" (id, "categoryId", name, slug, description, active, "createdAt", "updatedAt") VALUES ('cmndrx2ey006zxpl62yigtd8g', 'cmndrx2ev006xxpl63n3jy2az', 'Áudio e Vídeo', 'audio-e-video', 'Categoria consolidada Áudio e Vídeo', true, '2026-03-30 22:42:36.539', '2026-03-30 22:42:36.539');
INSERT INTO public."Subcategory" (id, "categoryId", name, slug, description, active, "createdAt", "updatedAt") VALUES ('cmndrx2f50072xpl6o385tepp', 'cmndrx2f20070xpl6dbckhnh5', 'Armazenamento', 'armazenamento', 'Categoria consolidada Armazenamento', true, '2026-03-30 22:42:36.545', '2026-03-30 22:42:36.545');
INSERT INTO public."Subcategory" (id, "categoryId", name, slug, description, active, "createdAt", "updatedAt") VALUES ('cmndrx2fc0075xpl6kk1oyt3k', 'cmndrx2f80073xpl6v83yzabd', 'Rede', 'rede', 'Categoria consolidada Rede', true, '2026-03-30 22:42:36.552', '2026-03-30 22:42:36.552');
INSERT INTO public."Subcategory" (id, "categoryId", name, slug, description, active, "createdAt", "updatedAt") VALUES ('cmndrx2fj0078xpl6ehkisrks', 'cmndrx2fg0076xpl61iv6rtgj', 'Energia', 'energia', 'Categoria consolidada Energia', true, '2026-03-30 22:42:36.559', '2026-03-30 22:42:36.559');
INSERT INTO public."Subcategory" (id, "categoryId", name, slug, description, active, "createdAt", "updatedAt") VALUES ('cmndrx2fp007bxpl6xtam1xmt', 'cmndrx2fm0079xpl62qt3j22j', 'Peça', 'peca', 'Categoria consolidada Peça', true, '2026-03-30 22:42:36.566', '2026-03-30 22:42:36.566');
INSERT INTO public."Subcategory" (id, "categoryId", name, slug, description, active, "createdAt", "updatedAt") VALUES ('cmndrx2fw007expl64jeny1ud', 'cmndrx2ft007cxpl6zucv9gip', 'Acessório', 'acessorio', 'Categoria consolidada Acessório', true, '2026-03-30 22:42:36.573', '2026-03-30 22:42:36.573');
INSERT INTO public."Subcategory" (id, "categoryId", name, slug, description, active, "createdAt", "updatedAt") VALUES ('cmndrx2g3007hxpl6z8skfoiv', 'cmndrx2fz007fxpl68zusnpei', 'Diverso', 'diverso', 'Categoria consolidada Diverso', true, '2026-03-30 22:42:36.58', '2026-03-30 22:42:36.58');


--
-- Data for Name: SupplierInteraction; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: _ManufacturerToSubcategory; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- PostgreSQL database dump complete
--

\unrestrict sEF7uqmZMzqkwLipymdHXbZ8hWzU55basFF1CWX8LcyMmf6ac96AgsXIqcEGZVL

