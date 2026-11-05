const tableBody = document.querySelector('#products-table');
const searchInput = document.querySelector('#search-input');
const productDialog = document.querySelector('#product-dialog');
const productForm = document.querySelector('#product-form');
const formError = document.querySelector('#form-error');
const saveButton = document.querySelector('#save-button');
const toast = document.querySelector('#toast');

let products = [];
let editingId = null;
let loadError = null;
let toastTimer;

const currency = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
document.querySelector('#today-date').textContent = new Intl.DateTimeFormat('es-MX', {
  day: 'numeric',
  month: 'short',
  year: 'numeric'
}).format(new Date());

function showToast(message, isError = false) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.toggle('error', isError);
  toast.classList.add('visible');
  toastTimer = window.setTimeout(() => toast.classList.remove('visible'), 3200);
}

function displayError(message) {
  tableBody.innerHTML = '';
  const row = document.createElement('tr');
  const cell = document.createElement('td');
  cell.className = 'table-message';
  cell.colSpan = 5;
  cell.textContent = message;
  row.append(cell);
  tableBody.append(row);
  document.querySelector('#results-count').textContent = 'No se pudieron cargar los resultados';
}

async function request(url, options = {}) {
  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers }
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Verifica que la aplicación esté iniciada.');
  }

  let body;
  try {
    body = await response.json();
  } catch {
    if (response.ok) throw new Error('El servidor devolvió una respuesta inválida.');
    body = {};
  }
  if (!response.ok) {
    throw new Error(body.error || 'Ocurrió un error al procesar la solicitud.');
  }
  return body;
}

function updateStats() {
  document.querySelector('#total-products').textContent = products.length.toLocaleString('es-MX');
  document.querySelector('#total-stock').textContent = products
    .reduce((total, product) => total + Number(product.stock), 0).toLocaleString('es-MX');
  document.querySelector('#inventory-value').textContent = currency.format(products
    .reduce((total, product) => total + Number(product.precio) * Number(product.stock), 0));
  document.querySelector('#low-stock').textContent = products
    .filter((product) => Number(product.stock) <= 5).length.toLocaleString('es-MX');
}

function createActionButton(label, className, iconPath, callback) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `row-action ${className}`;
  button.setAttribute('aria-label', label);
  button.title = label;
  button.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${iconPath}</svg>`;
  button.addEventListener('click', callback);
  return button;
}

function renderProducts() {
  if (loadError) {
    displayError(loadError);
    return;
  }

  const term = searchInput.value.trim().toLocaleLowerCase('es-MX');
  const filtered = products.filter((product) =>
    [product.nombre, product.descripcion].some((value) =>
      String(value || '').toLocaleLowerCase('es-MX').includes(term)
    )
  );
  tableBody.replaceChildren();

  if (filtered.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.className = 'table-message';
    cell.colSpan = 5;
    cell.textContent = products.length ? 'No hay productos que coincidan con tu búsqueda.' : 'Aún no hay productos. Agrega el primero a tu inventario.';
    row.append(cell);
    tableBody.append(row);
  } else {
    filtered.forEach((product, index) => {
      const row = document.createElement('tr');
      const productCell = document.createElement('td');
      const productContent = document.createElement('div');
      productContent.className = 'product-cell';

      const thumbnail = document.createElement('span');
      thumbnail.className = 'product-thumb';
      thumbnail.setAttribute('aria-hidden', 'true');
      thumbnail.textContent = String(product.nombre || '?').trim().charAt(0).toLocaleUpperCase('es-MX');

      const name = document.createElement('span');
      name.className = 'product-name';
      const nameText = document.createElement('strong');
      nameText.textContent = product.nombre;
      const productId = document.createElement('span');
      productId.textContent = `ID #${product.id}`;
      name.append(nameText, productId);
      productContent.append(thumbnail, name);
      productCell.append(productContent);

      const descriptionCell = document.createElement('td');
      descriptionCell.className = 'description-cell';
      descriptionCell.textContent = product.descripcion || 'Sin descripción';

      const priceCell = document.createElement('td');
      priceCell.className = 'price-cell';
      priceCell.textContent = currency.format(Number(product.precio));

      const stockCell = document.createElement('td');
      const stockBadge = document.createElement('span');
      stockBadge.className = `stock-badge${Number(product.stock) <= 5 ? ' low' : ''}`;
      stockBadge.textContent = `${Number(product.stock)} uds.`;
      stockCell.append(stockBadge);

      const actionsCell = document.createElement('td');
      actionsCell.className = 'actions-cell';
      actionsCell.append(
        createActionButton('Editar producto', 'edit', '<path d="m14 5 5 5M4 20l4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z"/>', () => openEditDialog(product)),
        createActionButton('Eliminar producto', 'delete', '<path d="M4 7h16M10 11v6m4-6v6M5 7l1 13h12l1-13M9 7V4h6v3"/>', () => deleteProduct(product))
      );
      row.append(productCell, descriptionCell, priceCell, stockCell, actionsCell);
      row.style.animationDelay = `${Math.min(index, 8) * 25}ms`;
      tableBody.append(row);
    });
  }

  document.querySelector('#results-count').textContent =
    `Mostrando ${filtered.length} de ${products.length} ${products.length === 1 ? 'producto' : 'productos'}`;
}

async function loadProducts() {
  loadError = null;
  tableBody.innerHTML = '<tr><td class="table-message" colspan="5"><span class="loading-spinner"></span> Cargando productos...</td></tr>';
  try {
    const result = await request('/api/productos');
    if (!Array.isArray(result)) throw new Error('El servidor devolvió una respuesta inesperada.');
    products = result;
    updateStats();
    renderProducts();
  } catch (error) {
    products = [];
    loadError = error.message;
    displayError(error.message);
    document.querySelector('#total-products').textContent = '—';
    document.querySelector('#total-stock').textContent = '—';
    document.querySelector('#inventory-value').textContent = '—';
    document.querySelector('#low-stock').textContent = '—';
  }
}

function openCreateDialog() {
  editingId = null;
  productForm.reset();
  formError.hidden = true;
  document.querySelector('#dialog-title').textContent = 'Agregar producto';
  saveButton.textContent = 'Guardar producto';
  productDialog.showModal();
  productForm.elements.nombre.focus();
}

function openEditDialog(product) {
  editingId = product.id;
  productForm.elements.nombre.value = product.nombre;
  productForm.elements.descripcion.value = product.descripcion || '';
  productForm.elements.precio.value = product.precio;
  productForm.elements.stock.value = product.stock;
  formError.hidden = true;
  document.querySelector('#dialog-title').textContent = 'Editar producto';
  saveButton.textContent = 'Guardar cambios';
  productDialog.showModal();
  productForm.elements.nombre.focus();
}

document.querySelector('#add-product-button').addEventListener('click', openCreateDialog);
document.querySelector('#close-dialog-button').addEventListener('click', () => productDialog.close());
document.querySelector('#cancel-button').addEventListener('click', () => productDialog.close());
document.querySelector('#refresh-button').addEventListener('click', loadProducts);
searchInput.addEventListener('input', renderProducts);

document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    searchInput.focus();
  }
});

productForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  formError.hidden = true;
  saveButton.disabled = true;
  saveButton.textContent = 'Guardando...';
  const payload = {
    nombre: productForm.elements.nombre.value.trim(),
    descripcion: productForm.elements.descripcion.value.trim(),
    precio: Number(productForm.elements.precio.value),
    stock: Number(productForm.elements.stock.value)
  };

  try {
    await request(editingId ? `/api/productos/${editingId}` : '/api/productos', {
      method: editingId ? 'PUT' : 'POST',
      body: JSON.stringify(payload)
    });
    productDialog.close();
    await loadProducts();
    showToast(editingId ? 'Producto actualizado correctamente.' : 'Producto agregado correctamente.');
  } catch (error) {
    formError.textContent = error.message;
    formError.hidden = false;
  } finally {
    saveButton.disabled = false;
    saveButton.textContent = editingId ? 'Guardar cambios' : 'Guardar producto';
  }
});

async function deleteProduct(product) {
  if (!window.confirm(`¿Eliminar "${product.nombre}" del inventario? Esta acción no se puede deshacer.`)) return;
  try {
    await request(`/api/productos/${product.id}`, { method: 'DELETE' });
    await loadProducts();
    showToast('Producto eliminado correctamente.');
  } catch (error) {
    showToast(error.message, true);
  }
}

loadProducts();
