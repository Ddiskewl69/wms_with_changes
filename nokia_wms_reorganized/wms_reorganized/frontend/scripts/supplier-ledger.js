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
    // ==========================
    // INITIALIZE DATATABLE
    // ==========================
    var supplierTable = $('#supplierTable').DataTable({
        'ajax': {
            'url': 'http://localhost:5000/api/suppliers',
            'dataSrc': ''
        },
        'columns': [
            {
                'data': null,
                'render': function(data, type, row, meta) {
                    return meta.row + 1;
                }
            },
            { 'data': 'supplier_name' },
            { 
                'data': 'mobile_number',
                'render': function(data) {
                    return data ? data : 'N/A';
                }
            },
            { 
                'data': 'address',
                'render': function(data) {
                    return data ? data : 'N/A';
                }
            },
            { 
                'data': 'created_at',
                'render': function(data) {
                    if (!data) return 'N/A';
                    var d = new Date(data);
                    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                }
            },
            {
                'data': null,
                'render': function(data, type, row) {
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
        'order': [[0, 'asc']],
        'scrollX': true,
        'dom': '<"d-flex justify-content-between align-items-center flex-wrap gap-2"lB><"table-responsive"t>ip',
        'lengthMenu': [[10, 20, 25, -1], ['10', '20', '25', 'Custom']],
        'lengthChange': true,
        'pageLength': 10,
        'buttons': [
            {
                extend: 'copy',
                text: '<i class="bi bi-clipboard"></i> Copy',
                className: 'btn btn-secondary btn-sm me-1'
            },
            {
                extend: 'csv',
                text: '<i class="bi bi-file-earmark-spreadsheet"></i> CSV',
                className: 'btn btn-success btn-sm me-1'
            },
            {
                extend: 'excel',
                text: '<i class="bi bi-file-earmark-excel"></i> Excel',
                className: 'btn btn-success btn-sm me-1'
            },
            {
                extend: 'pdf',
                text: '<i class="bi bi-file-earmark-pdf"></i> PDF',
                className: 'btn btn-danger btn-sm me-1'
            },
            {
                extend: 'print',
                text: '<i class="bi bi-printer"></i> Print',
                className: 'btn btn-secondary btn-sm'
            }
        ]
    });

    bindCustomLengthSelector(supplierTable);

    // ==========================
    // ADD BUTTON CLICK
    // ==========================
    $('#addSupplierBtn, #addSupplierBtnBottom').click(function() {
        resetForm();
        $('#supplierModalLabel').text('Add Supplier Ledger');
        $('#saveSupplierBtn').off('click').on('click', function(e) {
            e.preventDefault();
            saveSupplier();
        });
        $('#supplierModal').modal('show');
    });

    // ==========================
    // EDIT & DELETE ACTIONS (DELEGATED)
    // ==========================
    $(document).on('click', '.edit-btn', function() {
        const id = $(this).data('id');
        editSupplier(id);
    });

    $(document).on('click', '.delete-btn', function() {
        const id = $(this).data('id');
        deleteSupplier(id);
    });
});

// ==========================
// RESET FORM
// ==========================
function resetForm() {
    $('#supplierForm')[0].reset();
}

// ==========================
// SAVE (POST CREATE)
// ==========================
function saveSupplier() {
    if (!$('#supplierForm')[0].checkValidity()) {
        $('#supplierForm')[0].reportValidity();
        return;
    }

    const postData = {
        supplier_name: $('#supplierNameInput').val().trim(),
        mobile_number: $('#mobileInput').val().trim() || null,
        address: $('#addressInput').val().trim() || null
    };

    $.ajax({
        url: 'http://localhost:5000/api/suppliers',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(postData),
        success: function() {
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Supplier created successfully!',
                confirmButtonColor: '#1f5eff'
            });
            $('#supplierModal').modal('hide');
            $('#supplierTable').DataTable().ajax.reload();
        },
        error: function(err) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to create supplier: ' + (err.responseJSON?.error || err.statusText)
            });
        }
    });
}

// ==========================
// EDIT SUPPLIER DETAILS
// ==========================
function editSupplier(id) {
    $.ajax({
        url: `http://localhost:5000/api/suppliers/${id}`,
        method: 'GET',
        success: function(data) {
            resetForm();
            $('#supplierModalLabel').text('Edit Supplier Ledger');
            $('#supplierNameInput').val(data.supplier_name);
            $('#mobileInput').val(data.mobile_number || '');
            $('#addressInput').val(data.address || '');

            $('#saveSupplierBtn').off('click').on('click', function(e) {
                e.preventDefault();
                updateSupplier(id);
            });

            $('#supplierModal').modal('show');
        },
        error: function(err) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load details: ' + (err.responseJSON?.error || err.statusText)
            });
        }
    });
}

// ==========================
// UPDATE (PUT)
// ==========================
function updateSupplier(id) {
    if (!$('#supplierForm')[0].checkValidity()) {
        $('#supplierForm')[0].reportValidity();
        return;
    }

    const putData = {
        supplier_name: $('#supplierNameInput').val().trim(),
        mobile_number: $('#mobileInput').val().trim() || null,
        address: $('#addressInput').val().trim() || null
    };

    $.ajax({
        url: `http://localhost:5000/api/suppliers/${id}`,
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(putData),
        success: function() {
            Swal.fire({
                icon: 'success',
                title: 'Updated',
                text: 'Supplier updated successfully!',
                confirmButtonColor: '#1f5eff'
            });
            $('#supplierModal').modal('hide');
            $('#supplierTable').DataTable().ajax.reload();
        },
        error: function(err) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to update supplier: ' + (err.responseJSON?.error || err.statusText)
            });
        }
    });
}

// ==========================
// DELETE
// ==========================
function deleteSupplier(id) {
    Swal.fire({
        title: 'Are you sure?',
        text: 'You want to delete this supplier record?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `http://localhost:5000/api/suppliers/${id}`,
                method: 'DELETE',
                success: function() {
                    Swal.fire({
                        icon: 'success',
                        title: 'Deleted!',
                        text: 'Supplier has been deleted.',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    $('#supplierTable').DataTable().ajax.reload();
                },
                error: function(err) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Failed to delete supplier: ' + (err.responseJSON?.error || err.statusText)
                    });
                }
            });
        }
    });
}
