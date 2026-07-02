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

$(document).ready(function () {
    const costCenterTable = $('#costCenterTable').DataTable({
        ajax: {
            url: 'http://localhost:5000/api/cost-centers',
            dataSrc: ''
        },
        columns: [
            { data: 'id' },
            { data: 'store_name', render: function (data) { return data || 'N/A'; } },
            { data: 'customer_name', render: function (data) { return data || 'N/A'; } },
            { data: 'cost_center_name', render: function (data) { return data || 'N/A'; } },
            { data: 'contact_person', render: function (data) { return data || 'N/A'; } },
            { data: 'details', render: function (data) { return data || 'N/A'; } },
            { data: 'print_detail_1', render: function (data) { return data || 'N/A'; } },
            { data: 'print_detail_2', render: function (data) { return data || 'N/A'; } },
            { data: 'print_detail_3', render: function (data) { return data || 'N/A'; } },
            { data: 'print_detail_4', render: function (data) { return data || 'N/A'; } },
            {
                data: 'created_at',
                render: function (data) {
                    if (!data) return 'N/A';
                    const d = new Date(data);
                    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return `
                        <div class="d-flex gap-1">
                            <button class="btn btn-sm btn-primary edit-btn" data-id="${row.id}">
                                <i class="bi bi-pencil"></i> Edit
                            </button>
                            <button class="btn btn-sm btn-danger delete-btn" data-id="${row.id}">
                                <i class="bi bi-trash"></i> Delete
                            </button>
                        </div>
                    `;
                }
            }
        ],
        order: [[0, 'asc']],
        scrollX: true,
        dom: '<"d-flex justify-content-between align-items-center flex-wrap gap-2"lB><"table-responsive"t>ip',
        lengthMenu: [[10, 20, 25, -1], ['10', '20', '25', 'Custom']],
        pageLength: 10,
        buttons: [
            { extend: 'copy', text: '<i class="bi bi-clipboard"></i> Copy', className: 'btn btn-secondary btn-sm me-1' },
            { extend: 'csv', text: '<i class="bi bi-file-earmark-spreadsheet"></i> CSV', className: 'btn btn-success btn-sm me-1' },
            { extend: 'excel', text: '<i class="bi bi-file-earmark-excel"></i> Excel', className: 'btn btn-success btn-sm me-1' },
            { extend: 'pdf', text: '<i class="bi bi-file-earmark-pdf"></i> PDF', className: 'btn btn-danger btn-sm me-1' },
            { extend: 'print', text: '<i class="bi bi-printer"></i> Print', className: 'btn btn-secondary btn-sm' }
        ],
    });

    bindCustomLengthSelector(costCenterTable);

    loadStores();
    loadCustomers();

    $('#addCostCenterBtn').click(function () {
        resetForm();
        $('#costCenterModalLabel').text('Add Cost Center');
        $('#saveCostCenterBtn').off('click').on('click', function (e) {
            e.preventDefault();
            saveCostCenter();
        });
        $('#costCenterModal').modal('show');
    });

    $(document).on('click', '.edit-btn', function () {
        editCostCenter($(this).data('id'));
    });

    $(document).on('click', '.delete-btn', function () {
        deleteCostCenter($(this).data('id'));
    });
});

function loadStores() {
    $.ajax({
        url: 'http://localhost:5000/api/stores/dropdown',
        method: 'GET',
        success: function (data) {
            const $select = $('#storeSelect');
            $select.empty();
            $select.append('<option value="">Select Store</option>');
            data.forEach(store => {
                $select.append(`<option value="${store.id}">${store.store_name}</option>`);
            });
        },
        error: function (err) {
            console.error('Error loading stores:', err);
        }
    });
}

function loadCustomers() {
    $.ajax({
        url: 'http://localhost:5000/api/customers',
        method: 'GET',
        success: function (data) {
            const $select = $('#customerSelect');
            $select.empty();
            $select.append('<option value="">Select Customer</option>');
            data.forEach(customer => {
                $select.append(`<option value="${customer.id}">${customer.account_name || customer.billing_name || customer.customer_id}</option>`);
            });
        },
        error: function (err) {
            console.error('Error loading customers:', err);
        }
    });
}

function resetForm() {
    $('#costCenterForm')[0].reset();
}

function saveCostCenter() {
    if (!$('#costCenterForm')[0].checkValidity()) {
        $('#costCenterForm')[0].reportValidity();
        return;
    }

    const postData = {
        store_id: $('#storeSelect').val() || null,
        store_name: $('#storeSelect option:selected').text() === 'Select Store' ? null : $('#storeSelect option:selected').text(),
        customer_id: $('#customerSelect').val() || null,
        customer_name: $('#customerSelect option:selected').text() === 'Select Customer' ? null : $('#customerSelect option:selected').text(),
        cost_center_name: $('#costCenterNameInput').val().trim(),
        contact_person: $('#contactPersonInput').val().trim(),
        details: $('#detailsInput').val().trim() || null,
        print_detail_1: $('#printDetail1Input').val().trim() || null,
        print_detail_2: $('#printDetail2Input').val().trim() || null,
        print_detail_3: $('#printDetail3Input').val().trim() || null,
        print_detail_4: $('#printDetail4Input').val().trim() || null
    };

    $.ajax({
        url: 'http://localhost:5000/api/cost-centers',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(postData),
        success: function () {
            Swal.fire({ icon: 'success', title: 'Success', text: 'Cost center created successfully!', confirmButtonColor: '#1f5eff' });
            $('#costCenterModal').modal('hide');
            $('#costCenterTable').DataTable().ajax.reload();
        },
        error: function (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to create cost center: ' + (err.responseJSON?.error || err.statusText) });
        }
    });
}

function editCostCenter(id) {
    $.ajax({
        url: `http://localhost:5000/api/cost-centers/${id}`,
        method: 'GET',
        success: function (data) {
            resetForm();
            $('#costCenterModalLabel').text('Edit Cost Center');
            $('#storeSelect').val(data.store_id || '');
            $('#customerSelect').val(data.customer_id || '');
            $('#costCenterNameInput').val(data.cost_center_name || '');
            $('#contactPersonInput').val(data.contact_person || '');
            $('#detailsInput').val(data.details || '');
            $('#printDetail1Input').val(data.print_detail_1 || '');
            $('#printDetail2Input').val(data.print_detail_2 || '');
            $('#printDetail3Input').val(data.print_detail_3 || '');
            $('#printDetail4Input').val(data.print_detail_4 || '');

            $('#saveCostCenterBtn').off('click').on('click', function (e) {
                e.preventDefault();
                updateCostCenter(id);
            });

            $('#costCenterModal').modal('show');
        },
        error: function (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load cost center details: ' + (err.responseJSON?.error || err.statusText) });
        }
    });
}

function updateCostCenter(id) {
    if (!$('#costCenterForm')[0].checkValidity()) {
        $('#costCenterForm')[0].reportValidity();
        return;
    }

    const putData = {
        store_id: $('#storeSelect').val() || null,
        store_name: $('#storeSelect option:selected').text() === 'Select Store' ? null : $('#storeSelect option:selected').text(),
        customer_id: $('#customerSelect').val() || null,
        customer_name: $('#customerSelect option:selected').text() === 'Select Customer' ? null : $('#customerSelect option:selected').text(),
        cost_center_name: $('#costCenterNameInput').val().trim(),
        contact_person: $('#contactPersonInput').val().trim(),
        details: $('#detailsInput').val().trim() || null,
        print_detail_1: $('#printDetail1Input').val().trim() || null,
        print_detail_2: $('#printDetail2Input').val().trim() || null,
        print_detail_3: $('#printDetail3Input').val().trim() || null,
        print_detail_4: $('#printDetail4Input').val().trim() || null
    };

    $.ajax({
        url: `http://localhost:5000/api/cost-centers/${id}`,
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(putData),
        success: function () {
            Swal.fire({ icon: 'success', title: 'Updated', text: 'Cost center updated successfully!', confirmButtonColor: '#1f5eff' });
            $('#costCenterModal').modal('hide');
            $('#costCenterTable').DataTable().ajax.reload();
        },
        error: function (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to update cost center: ' + (err.responseJSON?.error || err.statusText) });
        }
    });
}

function deleteCostCenter(id) {
    Swal.fire({
        title: 'Are you sure?',
        text: 'You want to delete this cost center record?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `http://localhost:5000/api/cost-centers/${id}`,
                method: 'DELETE',
                success: function () {
                    Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Cost center record has been deleted.', timer: 1500, showConfirmButton: false });
                    $('#costCenterTable').DataTable().ajax.reload();
                },
                error: function (err) {
                    Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to delete record: ' + (err.responseJSON?.error || err.statusText) });
                }
            });
        }
    });
}
