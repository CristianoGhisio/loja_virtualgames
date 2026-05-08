export const MOCK_PAYABLES = [
  { id: 'PAG-001', description: 'Conta de Luz (Enel)', dueDate: '2024-02-15', value: 450.00, status: 'Pendente', category: 'Despesas Fixas' },
  { id: 'PAG-002', description: 'Boleto AllGames Dist.', dueDate: '2024-02-20', value: 12000.00, status: 'Pendente', category: 'Fornecedores' },
  { id: 'PAG-003', description: 'Aluguel Loja', dueDate: '2024-02-05', value: 3500.00, status: 'Pago', category: 'Despesas Fixas' },
  { id: 'PAG-004', description: 'Internet Fibra', dueDate: '2024-02-10', value: 150.00, status: 'Pago', category: 'Despesas Fixas' },
  { id: 'PAG-005', description: 'TechParts Importados', dueDate: '2024-02-25', value: 2800.00, status: 'Pendente', category: 'Fornecedores' },
];

export const MOCK_RECEIVABLES = [
  { id: 'REC-001', description: 'Venda #1002 (Cartão 3x)', dueDate: '2024-03-09', value: 299.90, status: 'Pendente', category: 'Vendas' },
  { id: 'REC-002', description: 'Serviço OS-882 (Pix)', dueDate: '2024-02-08', value: 150.00, status: 'Recebido', category: 'Serviços' },
  { id: 'REC-003', description: 'Venda #1005 (Cartão 10x)', dueDate: '2024-03-10', value: 3799.90, status: 'Pendente', category: 'Vendas' },
];

export const MOCK_CASH_FLOW = [
  { date: '2024-02-05', entry: 5400.00, exit: 3500.00, balance: 1900.00 },
  { date: '2024-02-06', entry: 3200.00, exit: 150.00, balance: 4950.00 },
  { date: '2024-02-07', entry: 4100.00, exit: 1200.00, balance: 7850.00 },
  { date: '2024-02-08', entry: 2800.00, exit: 350.00, balance: 10300.00 },
  { date: '2024-02-09', entry: 4549.70, exit: 0.00, balance: 14849.70 },
];

export const MOCK_MOVEMENTS = [
  { id: 'MOV-001', date: '2024-02-09', type: 'Entrada', product: 'PlayStation 5 Slim', quantity: 5, origin: 'Compra #4455' },
  { id: 'MOV-002', date: '2024-02-08', type: 'Saída', product: 'Controle DualSense', quantity: 1, origin: 'Venda #1001' },
  { id: 'MOV-003', date: '2024-02-08', type: 'Saída', product: 'Xbox Series X', quantity: 1, origin: 'Venda #1002' },
  { id: 'MOV-004', date: '2024-02-07', type: 'Saída', product: 'Tela iPhone 13', quantity: 1, origin: 'OS-890' },
  { id: 'MOV-005', date: '2024-02-06', type: 'Entrada', product: 'Conector HDMI PS5', quantity: 20, origin: 'Compra #4456' },
];

// PRODUTOS DE LOJA (Venda Final)
export const MOCK_PRODUCTS = [
  { id: '1', name: 'PlayStation 5 Slim Edição Digital', price: 3799.90, costPrice: 3200.00, stock: 8, category: 'Console', platform: 'PS5', barcode: '711719541028', brand: 'Sony', condition: 'Novo' },
  { id: '2', name: 'PlayStation 5 Slim com Leitor', price: 4299.90, costPrice: 3600.00, stock: 5, category: 'Console', platform: 'PS5', barcode: '711719541035', brand: 'Sony', condition: 'Novo' },
  { id: '3', name: 'Xbox Series S 512GB', price: 2599.90, costPrice: 2100.00, stock: 12, category: 'Console', platform: 'Xbox Series', barcode: '889842651355', brand: 'Microsoft', condition: 'Novo' },
  { id: '4', name: 'Xbox Series X 1TB', price: 4499.90, costPrice: 3800.00, stock: 4, category: 'Console', platform: 'Xbox Series', barcode: '889842640724', brand: 'Microsoft', condition: 'Novo' },
  { id: '5', name: 'Nintendo Switch OLED White', price: 2199.90, costPrice: 1800.00, stock: 15, category: 'Console', platform: 'Switch', barcode: '045496883386', brand: 'Nintendo', condition: 'Novo' },
  { id: '6', name: 'Controle DualSense Midnight Black', price: 449.90, costPrice: 320.00, stock: 25, category: 'Acessório', brand: 'Sony', condition: 'Novo' },
  { id: '7', name: 'Controle Xbox Robot White', price: 399.90, costPrice: 280.00, stock: 18, category: 'Acessório', brand: 'Microsoft', condition: 'Novo' },
  { id: '8', name: 'Headset Pulse 3D', price: 599.90, costPrice: 400.00, stock: 8, category: 'Acessório', brand: 'Sony', condition: 'Novo' },
  { id: '9', name: 'Marvel\'s Spider-Man 2 (PS5)', price: 299.90, costPrice: 180.00, stock: 40, category: 'Jogo', brand: 'Sony', condition: 'Novo' },
  { id: '10', name: 'Super Mario Bros. Wonder', price: 299.90, costPrice: 190.00, stock: 35, category: 'Jogo', brand: 'Nintendo', condition: 'Novo' },
  { id: '11', name: 'EA Sports FC 24 (PS5)', price: 249.90, costPrice: 150.00, stock: 20, category: 'Jogo', brand: 'EA', condition: 'Novo' },
  { id: '12', name: 'SSD NVMe Kingston Fury 1TB', price: 650.00, costPrice: 400.00, stock: 10, category: 'Hardware', brand: 'Kingston', condition: 'Novo' },
  { id: '13', name: 'PlayStation 4 Slim 500GB (Usado)', price: 1500.00, costPrice: 1000.00, stock: 3, category: 'Console', platform: 'PS4', barcode: 'PS4-USED-001', brand: 'Sony', condition: 'Usado' },
];

// PEÇAS PARA REPARO (Uso interno ou venda)
export const MOCK_PARTS = [
  { id: '101', name: 'Tela Display iPhone 13 Incell', price: 450.00, costPrice: 250.00, stock: 5, category: 'Tela', brand: 'Apple', condition: 'Novo' },
  { id: '102', name: 'Tela Display iPhone 11 Original', price: 350.00, costPrice: 180.00, stock: 8, category: 'Tela', brand: 'Apple', condition: 'Novo' },
  { id: '103', name: 'Bateria iPhone 11 Premium', price: 180.00, costPrice: 80.00, stock: 12, category: 'Bateria', brand: 'Apple', condition: 'Novo' },
  { id: '104', name: 'Analógico 3D Magnético (Hall Effect)', price: 45.00, costPrice: 15.00, stock: 50, category: 'Componente', brand: 'Genérico', condition: 'Novo' },
  { id: '105', name: 'Conector HDMI PS5 (Porta)', price: 60.00, costPrice: 20.00, stock: 30, category: 'Conector', brand: 'Sony', condition: 'Novo' },
  { id: '106', name: 'CI Retimer HDMI PS5', price: 120.00, costPrice: 60.00, stock: 10, category: 'Componente', brand: 'Sony', condition: 'Novo' },
  { id: '107', name: 'Pasta Térmica Arctic Silver 5 (3.5g)', price: 80.00, costPrice: 45.00, stock: 15, category: 'Insumo', brand: 'Arctic', condition: 'Novo' },
  { id: '108', name: 'Kit Botões Gatilho L2/R2 PS5', price: 35.00, costPrice: 10.00, stock: 20, category: 'Componente', brand: 'Sony', condition: 'Novo' },
  { id: '109', name: 'Tela LCD Nintendo Switch Lite', price: 250.00, costPrice: 150.00, stock: 4, category: 'Tela', brand: 'Nintendo', condition: 'Novo' },
  { id: '110', name: 'Carcaça Traseira iPhone XR Preta', price: 120.00, costPrice: 60.00, stock: 6, category: 'Carcaça', brand: 'Apple', condition: 'Novo' },
];

export const MOCK_CLIENTS = [
  { id: '1', name: 'João da Silva', email: 'joao.silva@gmail.com', cpf: '123.456.789-00', phone: '(11) 98888-1111' },
  { id: '2', name: 'Maria Oliveira', email: 'maria.oli@hotmail.com', cpf: '234.567.890-11', phone: '(11) 97777-2222' },
  { id: '3', name: 'Pedro Santos', email: 'pedro.santos@yahoo.com', cpf: '345.678.901-22', phone: '(11) 96666-3333' },
  { id: '4', name: 'Ana Costa', email: 'ana.costa@gmail.com', cpf: '456.789.012-33', phone: '(11) 95555-4444' },
  { id: '5', name: 'Lucas Ferreira', email: 'lucas.f@outlook.com', cpf: '567.890.123-44', phone: '(11) 94444-5555' },
];

export const MOCK_SALES = [
  { id: 'VEN-1001', date: '2024-02-09', client: 'João da Silva', items: 2, total: 4249.80, status: 'Finalizada', payment: 'PIX' },
  { id: 'VEN-1002', date: '2024-02-09', client: 'Maria Oliveira', items: 1, total: 299.90, status: 'Finalizada', payment: 'Cartão Crédito' },
  { id: 'VEN-1003', date: '2024-02-08', client: 'Pedro Santos', items: 3, total: 1250.00, status: 'Cancelada', payment: 'Dinheiro' },
  { id: 'VEN-1004', date: '2024-02-09', client: 'Ana Costa', items: 1, total: 449.90, status: 'Em Andamento', payment: 'Aguardando' },
];

export const MOCK_RETURNS = [
  { id: 'TR-501', date: '2024-02-07', originalSale: 'VEN-0988', client: 'Carlos Souza', product: 'Controle DualSense', reason: 'Defeito no R2 (Drift)', status: 'Aprovada' },
  { id: 'TR-502', date: '2024-02-08', originalSale: 'VEN-0992', client: 'Ana Costa', product: 'Headset Pulse 3D', reason: 'Arrependimento (7 dias)', status: 'Em Análise' },
];

export const MOCK_WARRANTIES = [
  { id: 'GAR-201', client: 'João da Silva', product: 'PlayStation 5', expiry: '2025-02-09', status: 'Ativa' },
  { id: 'GAR-202', client: 'Maria Oliveira', product: 'Xbox Series X', expiry: '2025-01-15', status: 'Expirada' },
  { id: 'GAR-203', client: 'Lucas Ferreira', product: 'Reparo Tela iPhone 13', expiry: '2024-05-09', status: 'Ativa' },
];

export const MOCK_SERVICES = [
  { id: '1', name: 'Limpeza Preventiva Console (PS5/Xbox)', price: 180.00, description: 'Limpeza interna completa e troca de pasta térmica', active: true },
  { id: '2', name: 'Troca de Conector HDMI (PS5/Series)', price: 350.00, description: 'Substituição do conector HDMI danificado', active: true },
  { id: '3', name: 'Reparo de Drift (Joy-Con/DualSense)', price: 90.00, description: 'Troca do mecanismo analógico', active: true },
  { id: '4', name: 'Troca de Tela iPhone 13', price: 850.00, description: 'Mão de obra + Peça (Incell)', active: true },
  { id: '5', name: 'Reballing Processador/APU', price: 600.00, description: 'Reparo avançado de placa mãe', active: true },
  { id: '6', name: 'Atualização de BIOS/Software', price: 100.00, description: 'Restauração de sistema', active: true },
];

export const MOCK_CATEGORIES = [
  { id: '1', name: 'Consoles', description: 'Videogames de mesa e portáteis', active: true },
  { id: '2', name: 'Acessórios', description: 'Controles, cabos e headsets', active: true },
  { id: '3', name: 'Jogos', description: 'Mídia física e digital', active: true },
  { id: '4', name: 'Hardware', description: 'SSDs, HDs e expansões', active: true },
  { id: '5', name: 'Peças - Telas', description: 'Displays e Touchscreens', active: true },
  { id: '6', name: 'Peças - Baterias', description: 'Baterias internas', active: true },
  { id: '7', name: 'Peças - Componentes', description: 'CIs, Conectores, Botões', active: true },
];

export const MOCK_BRANDS = [
  { id: '1', name: 'Sony', active: true },
  { id: '2', name: 'Microsoft', active: true },
  { id: '3', name: 'Nintendo', active: true },
  { id: '4', name: 'Apple', active: true },
  { id: '5', name: 'Samsung', active: true },
  { id: '6', name: 'Logitech', active: true },
  { id: '7', name: 'Razer', active: true },
  { id: '8', name: 'Kingston', active: true },
];

export const MOCK_SUPPLIERS = [
  { id: '1', name: 'AllGames Distribuidora', contact: 'vendas@allgames.com.br', phone: '(11) 3333-4444', active: true },
  { id: '2', name: 'TechParts Importados', contact: 'contato@techparts.com', phone: '(41) 98888-7777', active: true },
  { id: '3', name: 'Sony Brasil', contact: 'representante@sony.com.br', phone: '0800 777 7000', active: true },
  { id: '4', name: 'China Express Peças', contact: 'order@chinaexpress.com', phone: '+86 139 0000 0000', active: true },
];

export const MOCK_CONSOLE_MODELS = [
  { id: '1', name: 'PlayStation 5 Slim', brand: 'Sony', active: true },
  { id: '2', name: 'PlayStation 5 Pro', brand: 'Sony', active: true },
  { id: '3', name: 'Xbox Series X', brand: 'Microsoft', active: true },
  { id: '4', name: 'Xbox Series S', brand: 'Microsoft', active: true },
  { id: '5', name: 'Nintendo Switch OLED', brand: 'Nintendo', active: true },
  { id: '6', name: 'Nintendo Switch Lite', brand: 'Nintendo', active: true },
  { id: '7', name: 'iPhone 13', brand: 'Apple', active: true },
  { id: '8', name: 'iPhone 14', brand: 'Apple', active: true },
  { id: '9', name: 'Samsung S23', brand: 'Samsung', active: true },
];
