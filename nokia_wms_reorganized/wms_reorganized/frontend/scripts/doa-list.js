const WORKFLOW_STEPS = [
    { key: 'doa', label: 'DOA raised', icon: 'bi-exclamation-circle' },
    { key: 'inventory', label: 'Inventory', icon: 'bi-box-seam' },
    { key: 'dcout', label: 'DC OUT', icon: 'bi-truck' },
    { key: 'dcin', label: 'DC IN', icon: 'bi-download' },
    { key: 'stn', label: 'STN', icon: 'bi-arrow-left-right' },
    { key: 'closed', label: 'Closed!', icon: 'bi-check-circle' }
];

function bindCustomLengthSelector(table) {
    const $lengthSelect = $(table.table().container()).find('.dataTables_length select');
    if (!$lengthSelect.length) return;

    $lengthSelect.off('change.customLength').on('change.customLength', function () {
        const selectedText = $(this).find('option:selected').text();
        if (selectedText !== 'Custom') return;

        const currentLength = table.page.len();
        const promptValue = prompt('Enter number of rows to display:', currentLength);
        if (promptValue === null) {
            $(this).val(currentLength);
            return;
        }

        const parsedValue = parseInt(promptValue, 10);
        if (!Number.isNaN(parsedValue) && parsedValue > 0) {
            table.page.len(parsedValue).draw();
        } else {
            alert('Please enter a valid number greater than 0.');
            $(this).val(currentLength);
        }
    });
}

const NEXT_STEP_ROUTE = {
    doa: '../templates/grn.html?mode=doa&id=',
    inventory: '../templates/dc-out.html?mode=doa&id=',
    dcout: '../templates/dc-in.html?mode=doa&id=',
    dcin: '../templates/stn.html?mode=doa&id=',
    stn: '../templates/stn.html?mode=doa&id=',
    closed: null
};

const DOA_MOCK = [
    { id:'DOA-0001', account:'Airtel', customer:'Bharti Airtel', productBU:'MN', product:'Product_name_A', doaId:'21345', iso:'765346', qty:575, createdAt:'12/03/2026', createdBy:'Neha Sain', rma:'3142563', pr:'0987232', oo:'124567', currentStep:'dcout' },
    { id:'DOA-0002', account:'Reliance Jio', customer:'Reliance Jio', productBU:'CNS', product:'Product_name_B', doaId:'21345', iso:'765346', qty:575, createdAt:'12/03/2026', createdBy:'Neha Sain', rma:'3142564', pr:'0987233', oo:'124568', currentStep:'inventory' },
    { id:'DOA-0003', account:'Airtel', customer:'Bharti Airtel', productBU:'MN', product:'Product_name_A', doaId:'21345', iso:'765346', qty:575, createdAt:'12/03/2026', createdBy:'Rahul Kumar', rma:'3142565', pr:'0987234', oo:'124569', currentStep:'dcin' },
    { id:'DOA-0004', account:'Vodafone', customer:'Vodafone', productBU:'CNS', product:'Product_name_C', doaId:'21345', iso:'765346', qty:575, createdAt:'12/03/2026', createdBy:'Rahul Kumar', rma:'3142566', pr:'0987235', oo:'124570', currentStep:'stn' },
    { id:'DOA-0005', account:'Airtel', customer:'Bharti Airtel', productBU:'MN', product:'Product_name_A', doaId:'21345', iso:'765346', qty:575, createdAt:'12/03/2026', createdBy:'Neha Sain', rma:'3142567', pr:'0987236', oo:'124571', currentStep:'closed' },
    { id:'DOA-0006', account:'Reliance Jio', customer:'Reliance Jio', productBU:'CNS', product:'Product_name_B', doaId:'21345', iso:'765346', qty:575, createdAt:'12/03/2026', createdBy:'Neha Sain', rma:'3142568', pr:'0987237', oo:'124572', currentStep:'closed' }
];

let activeFilter = 'Open';
let currentDOA = null;
let originalValues = null;
let dtInstance = null;

function stepIndex(step) {
    return WORKFLOW_STEPS.findIndex(s => s.key === step);
}

function remainingSteps(step) {
    const idx = stepIndex(step);
    const closedIdx = WORKFLOW_STEPS.length - 1;
    if (idx < 0) return closedIdx;
    return Math.max(0, closedIdx - idx);
}

function computedStatus(doa) {
    return remainingSteps(doa.currentStep) > 0 ? 'Open' : 'Closed';
}

function tooltipText(step) {
    const idx = stepIndex(step);
    const pending = WORKFLOW_STEPS.slice(idx + 1);
    return pending.length ? 'Remaining: ' + pending.map(s => s.label).join(' -> ') : 'Closed';
}

function pillHtml(doa) {
    const rem = remainingSteps(doa.currentStep);
    if (rem === 0) {
        return '<span class="pill pill-closed"><i class="bi bi-check-circle-fill"></i> Closed</span>';
    }

    return `<span class="pill pill-open" data-bs-toggle="tooltip" title="${tooltipText(doa.currentStep)}">
        Open <span class="badge-count">${rem}</span>
    </span>`;
}

function editBtnHtml(doa) {
    const closed = computedStatus(doa) === 'Closed';
    if (closed) {
        return `<button class="btn-edit" disabled title="Closed - read-only" aria-label="Edit ${doa.id}">
            <i class="bi bi-pencil-square"></i>
        </button>`;
    }

    return `<button class="btn-edit btn-open-overlay" data-id="${doa.id}" aria-label="Edit ${doa.id}">
        <i class="bi bi-pencil-square"></i>
    </button>`;
}

function buildTable(data) {
    if (dtInstance) {
        dtInstance.destroy();
        dtInstance = null;
    }

    const tbody = document.getElementById('doaTableBody');
    tbody.innerHTML = '';

    data.forEach((doa, i) => {
        const status = computedStatus(doa);
        const rowCls = status === 'Closed' ? ' class="text-muted"' : '';
        tbody.innerHTML += `
            <tr${rowCls} data-id="${doa.id}">
                <td>${String(i + 1).padStart(2, '0')}.</td>
                <td>${doa.product}</td>
                <td>${doa.doaId}</td>
                <td>${doa.iso}</td>
                <td>${pillHtml(doa)}</td>
                <td>${doa.qty}</td>
                <td>${doa.createdAt}</td>
                <td>${editBtnHtml(doa)}</td>
            </tr>`;
    });

    dtInstance = $('#doaListTable').DataTable({
        pageLength: 10,
        responsive: true,
        lengthChange: true,
        ordering: true,
        info: true,
        dom: '<"d-flex justify-content-between align-items-center flex-wrap gap-2"lB><"table-responsive"t>ip',
        lengthChange: true,
        lengthMenu: [[10, 20, 25, -1], ['10', '20', '25', 'Custom']],
        buttons: [
            { extend: 'copy', text: '<i class="bi bi-clipboard"></i> Copy', className: 'btn btn-secondary btn-sm me-1' },
            { extend: 'csv', text: '<i class="bi bi-file-earmark-spreadsheet"></i> CSV', className: 'btn btn-success btn-sm me-1' },
            { extend: 'excel', text: '<i class="bi bi-file-earmark-excel"></i> Excel', className: 'btn btn-success btn-sm me-1' },
            { extend: 'pdf', text: '<i class="bi bi-file-earmark-pdf"></i> PDF', className: 'btn btn-danger btn-sm me-1' },
            { extend: 'print', text: '<i class="bi bi-printer"></i> Print', className: 'btn btn-secondary btn-sm' }
        ],
        language: {
            emptyTable: 'No records found.',
            zeroRecords: 'No matching records.',
            pageLength: 10,
            info: '_START_-_END_ of _TOTAL_',
            infoEmpty: 'No entries',
            paginate: {
                previous: '<i class="bi bi-chevron-left"></i>',
                next: '<i class="bi bi-chevron-right"></i>'
            }
        },
        columnDefs: [
            { orderable: false, targets: [0, 4, 7] }
        ]
    });

    bindCustomLengthSelector(dtInstance);

    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
        new bootstrap.Tooltip(el, { placement: 'top', trigger: 'hover' });
    });
}

function getFilterValues() {
    return {
        account: document.getElementById('filterAccount').value,
        customer: document.getElementById('filterCustomer').value,
        productBU: document.getElementById('filterProductBU').value,
        product: document.getElementById('filterProduct').value,
        iso: document.getElementById('filterISO').value.trim().toLowerCase()
    };
}

function applyFilter() {
    const filters = getFilterValues();
    const filtered = DOA_MOCK.filter(d => {
        if (computedStatus(d) !== activeFilter) return false;
        if (filters.account && d.account !== filters.account) return false;
        if (filters.customer && d.customer !== filters.customer) return false;
        if (filters.productBU && d.productBU !== filters.productBU) return false;
        if (filters.product && d.product !== filters.product) return false;
        if (filters.iso && !d.iso.toLowerCase().includes(filters.iso) && !d.id.toLowerCase().includes(filters.iso)) return false;
        return true;
    });

    buildTable(filtered);
}

function clearFilters() {
    ['filterAccount', 'filterCustomer', 'filterProductBU', 'filterProduct', 'filterISO'].forEach(id => {
        document.getElementById(id).value = '';
    });

    activeFilter = 'Open';
    document.querySelectorAll('.status-toggle button').forEach(b => {
        b.classList.toggle('active', b.dataset.filter === 'Open');
    });

    applyFilter();
}

function buildStepper(currentStep) {
    const doneIdx = stepIndex(currentStep);
    return WORKFLOW_STEPS.map((step, idx) => {
        const isDone = idx < doneIdx || currentStep === 'closed';
        const isCurrent = idx === doneIdx && currentStep !== 'closed';
        const cls = isCurrent ? 'current' : (isDone ? 'done' : '');
        const connector = idx < WORKFLOW_STEPS.length - 1
            ? `<div class="wf-connector ${idx < doneIdx ? 'done' : ''}"></div>`
            : '';

        return `<div class="wf-step ${cls}">
            <div class="wf-step-icon"><i class="bi ${step.icon}"></i></div>
            <div class="wf-step-label">${step.label}</div>
        </div>${connector}`;
    }).join('');
}

function snapshotForm() {
    return {
        product: document.getElementById('oProduct').value,
        doaId: document.getElementById('oDOAID').value,
        iso: document.getElementById('oISO').value,
        qty: document.getElementById('oQty').value,
        rma: document.getElementById('oRMA').value,
        pr: document.getElementById('oPR').value,
        oo: document.getElementById('oOO').value
    };
}

function hasChanges() {
    return originalValues && JSON.stringify(snapshotForm()) !== JSON.stringify(originalValues);
}

function openOverlay(doa) {
    currentDOA = doa;
    const closed = computedStatus(doa) === 'Closed';

    document.getElementById('overlayTitle').textContent = doa.product;
    document.getElementById('overlayMeta').innerHTML =
        `Created by <strong>${doa.createdBy}</strong> at ${formatOverlayDate(doa.createdAt)}`;

    document.getElementById('overlayDetailRow').innerHTML =
        [['Product', doa.product], ['DOA ID', doa.doaId], ['ISO Number', doa.iso], ['Quantity', doa.qty], ['RMA Number', doa.rma], ['PR Number', doa.pr], ['OO Number', doa.oo]]
            .map(([k, v]) => `<span class="overlay-detail-badge"><strong>${k}</strong>${v}</span>`)
            .join('');

    document.getElementById('workflowStepper').innerHTML = buildStepper(doa.currentStep);

    document.getElementById('oProduct').value = doa.product;
    document.getElementById('oDOAID').value = doa.doaId;
    document.getElementById('oISO').value = doa.iso;
    document.getElementById('oQty').value = doa.qty;
    document.getElementById('oRMA').value = doa.rma;
    document.getElementById('oPR').value = doa.pr;
    document.getElementById('oOO').value = doa.oo;

    originalValues = snapshotForm();

    document.getElementById('overlayFormFields')
        .querySelectorAll('input, select')
        .forEach(el => el.disabled = closed);

    document.getElementById('overlayReadOnlyNote').style.display = closed ? 'flex' : 'none';
    document.getElementById('btnSaveChanges').style.display = closed ? 'none' : '';

    const nextRoute = NEXT_STEP_ROUTE[doa.currentStep];
    const btnFill = document.getElementById('btnFillNext');
    if (!closed && nextRoute) {
        btnFill.style.display = '';
        btnFill.onclick = () => { window.location.href = nextRoute + doa.id; };
    } else {
        btnFill.style.display = 'none';
    }

    document.getElementById('doaEditOverlay').classList.add('show');
    document.getElementById('overlayBackdrop').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function formatOverlayDate(str) {
    const [d, m, y] = str.split('/');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[+m - 1]}-${d}-${y}`;
}

function closeOverlay() {
    document.getElementById('doaEditOverlay').classList.remove('show');
    document.getElementById('overlayBackdrop').classList.remove('show');
    document.body.style.overflow = '';
    currentDOA = originalValues = null;
}

async function requestClose() {
    if (hasChanges()) {
        const res = await Swal.fire({
            title: 'Unsaved changes',
            text: 'Discard your changes?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Discard',
            cancelButtonText: 'Keep editing',
            confirmButtonColor: '#b42318',
            cancelButtonColor: '#2563eb'
        });
        if (!res.isConfirmed) return;
    }
    closeOverlay();
}

function saveChanges() {
    if (!hasChanges()) {
        Swal.fire({
            icon: 'info',
            title: 'Nothing to save',
            text: 'No fields have been changed.',
            timer: 1800,
            showConfirmButton: false
        });
        return;
    }

    const snap = snapshotForm();
    Object.assign(currentDOA, {
        product: snap.product,
        doaId: snap.doaId,
        iso: snap.iso,
        qty: +snap.qty,
        rma: snap.rma,
        pr: snap.pr,
        oo: snap.oo
    });

    originalValues = snapshotForm();
    applyFilter();

    Swal.fire({
        icon: 'success',
        title: 'Saved',
        text: `${currentDOA.id} updated successfully.`,
        timer: 1800,
        showConfirmButton: false
    });
}

$(document).ready(function () {
    applyFilter();

    document.querySelectorAll('.status-toggle button').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.status-toggle button').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            activeFilter = this.dataset.filter;
            applyFilter();
        });
    });

    ['filterAccount', 'filterCustomer', 'filterProductBU', 'filterProduct', 'filterISO'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', applyFilter);
            el.addEventListener('change', applyFilter);
        }
    });

    document.getElementById('btnClearFilters').addEventListener('click', clearFilters);

    document.getElementById('doaTableBody').addEventListener('click', function (e) {
        const btn = e.target.closest('.btn-open-overlay');
        if (!btn || btn.disabled) return;
        const doa = DOA_MOCK.find(d => d.id === btn.dataset.id);
        if (doa) openOverlay(doa);
    });

    document.getElementById('closeOverlay').addEventListener('click', requestClose);
    document.getElementById('overlayBackdrop').addEventListener('click', requestClose);
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') requestClose();
    });

    document.getElementById('btnSaveChanges').addEventListener('click', saveChanges);
});
