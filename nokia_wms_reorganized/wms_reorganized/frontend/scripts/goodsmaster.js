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
    var goodsTable = $('#goodsTable').DataTable({
        'ajax': {
            'url': 'http://localhost:5000/api/goods',
            'dataSrc': ''
        },
        'columns': [
            {
                'data': null,
                'render': function(data, type, row, meta) {
                    return meta.row + 1;
                }
            },
            { 'data': 'category_name' },
            { 'data': 'description' },
            { 'data': 'part_code' },
            { 
                'data': 'weight',
                'render': function(data) {
                    return data ? data : 'N/A';
                }
            },
            { 
                'data': 'volume',
                'render': function(data) {
                    return data ? data : 'N/A';
                }
            },
            { 
                'data': 'length',
                'render': function(data) {
                    return data ? data : 'N/A';
                }
            },
            { 
                'data': 'breadth',
                'render': function(data) {
                    return data ? data : 'N/A';
                }
            },
            { 
                'data': 'height',
                'render': function(data) {
                    return data ? data : 'N/A';
                }
            },
            { 
                'data': 'hsn_code',
                'render': function(data) {
                    return data ? data : 'N/A';
                }
            },
            { 
                'data': null,
                'render': function(data, type, row) {
                    return row.uom === 'other' ? row.uom_other : row.uom;
                }
            },
            { 
                'data': 'gst_percent',
                'render': function(data) {
                    return data ? data + '%' : 'N/A';
                }
            },
            {
                'data': 'status',
                'render': function(data) {
                    const statusClass = data === 'Active' ? 'active' : 'inactive';
                    return `<span class="status ${statusClass}">${data}</span>`;
                }
            },
            {
                'data': null,
                'render': function(data, type, row) {
                    return `
                        <button class="btn btn-sm btn-primary edit-btn" data-id="${row.id}">
                            <i class="bi bi-pencil"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-danger delete-btn" data-id="${row.id}">
                            <i class="bi bi-trash"></i> Delete
                        </button>
                    `;
                },
                'exportable': false
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

    // ==========================
    // LOAD CATEGORIES
    // ==========================
    loadCategories();

    // ==========================
    // UOM SELECT CHANGE
    // ==========================
    $('#uomSelect').on('change', function() {
        if ($(this).val() === 'other') {
            $('#uomOtherContainer').show();
        } else {
            $('#uomOtherContainer').hide();
            $('#uomOtherInput').val('');
        }
    });

    // ==========================
    // GST SELECT CHANGE
    // ==========================
    $('#gstSelect').on('change', function() {
        if ($(this).val() === 'other') {
            $('#gstOtherContainer').show();
        } else {
            $('#gstOtherContainer').hide();
            $('#gstOtherInput').val('');
        }
    });

    // ==========================
    // PART CODE AUTO-FILL
    // ==========================
    $('#descriptionInput').on('blur', function() {
        if ($('#partCodeInput').val().trim() === '') {
            $('#partCodeInput').val($(this).val().trim());
        }
    });

    // ==========================
    // ADD GOODS BUTTON
    // ==========================
    $('#goodsModal').on('show.bs.modal', function() {
        resetForm();
        $('.modal-title').text('Add New Goods');
        $('.modal-footer .btn-primary').off('click').on('click', function(e) {
            e.preventDefault();
            saveGoods();
        });
    });

    // ==========================
    // DELETE BUTTON
    // ==========================
    $(document).on('click', '.delete-btn', function() {
        const id = $(this).data('id');
        deleteGoods(id);
    });

    // ==========================
    // EDIT BUTTON
    // ==========================
    $(document).on('click', '.edit-btn', function() {
        const id = $(this).data('id');
        editGoods(id);
    });
});

// ==========================
// LOAD CATEGORIES
// ==========================
function loadCategories() {
    $.ajax({
        url: 'http://localhost:5000/api/categories',
        method: 'GET',
        success: function(data) {
            $('#categorySelect').empty();
            $('#categorySelect').append('<option value="">Select Category</option>');
            data.forEach(category => {
                $('#categorySelect').append(`<option value="${category.id}">${category.category_name}</option>`);
            });
        },
        error: function(err) {
            console.error('Error loading categories:', err);
        }
    });
}

// ==========================
// RESET FORM
// ==========================
function resetForm() {
    $('#goodsForm')[0].reset();
    $('#uomOtherContainer').hide();
    $('#gstOtherContainer').hide();
    $('#categorySelect').val('');
    $('#statusSelect').val('Active');
}

// ==========================
// SAVE GOODS
// ==========================
function saveGoods() {
    const category = $('#categorySelect').val();
    const description = $('#descriptionInput').val();
    const partCode = $('#partCodeInput').val();
    const weight = $('#weightInput').val();
    const volume = $('#volumeInput').val();
    const length = $('#lengthInput').val();
    const breadth = $('#breadthInput').val();
    const height = $('#heightInput').val();
    const hsnCode = $('#hsnCodeInput').val();
    const uom = $('#uomSelect').val();
    const uomOther = $('#uomOtherInput').val();
    const gst = $('#gstSelect').val();
    const gstOther = $('#gstOtherInput').val();
    const status = $('#statusSelect').val();

    if (!category || !description) {
        Swal.fire({
            icon: 'warning',
            title: 'Missing Fields',
            text: 'Please fill Category and Description.'
        });
        return;
    }

    const data = {
        category_id: category,
        description: description,
        part_code: partCode || description,
        weight: weight || null,
        volume: volume || null,
        length: length || null,
        breadth: breadth || null,
        height: height || null,
        hsn_code: hsnCode,
        uom: uom,
        uom_other: uomOther,
        gst_percent: gst === 'other' ? gstOther : gst,
        status: status
    };

    $.ajax({
        url: 'http://localhost:5000/api/goods',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function(response) {
            Swal.fire({
                icon: 'success',
                title: 'Goods Added',
                text: 'New item successfully created.',
                confirmButtonColor: '#1f5eff'
            });
            $('#goodsModal').modal('hide');
            $('#goodsTable').DataTable().ajax.reload();
        },
        error: function(err) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to save goods.'
            });
        }
    });
}

// ==========================
// DELETE GOODS
// ==========================
function deleteGoods(id) {
    Swal.fire({
        title: 'Are you sure?',
        text: 'You won\'t be able to revert this!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#1f5eff',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `http://localhost:5000/api/goods/${id}`,
                method: 'DELETE',
                success: function(response) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Deleted!',
                        text: 'Goods has been deleted.'
                    });
                    $('#goodsTable').DataTable().ajax.reload();
                },
                error: function(err) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Failed to delete goods.'
                    });
                }
            });
        }
    });
}

// ==========================
// EDIT GOODS
// ==========================
function editGoods(id) {
    $.ajax({
        url: `http://localhost:5000/api/goods/${id}`,
        method: 'GET',
        success: function(data) {
            $('#categorySelect').val(data.category_id);
            $('#descriptionInput').val(data.description);
            $('#partCodeInput').val(data.part_code);
            $('#weightInput').val(data.weight);
            $('#volumeInput').val(data.volume);
            $('#lengthInput').val(data.length);
            $('#breadthInput').val(data.breadth);
            $('#heightInput').val(data.height);
            $('#hsnCodeInput').val(data.hsn_code);
            $('#uomSelect').val(data.uom);
            
            if (data.uom === 'other') {
                $('#uomOtherContainer').show();
                $('#uomOtherInput').val(data.uom_other);
            } else {
                $('#uomOtherContainer').hide();
            }
            
            if (data.gst_percent && !['0', '5', '12', '18', '28'].includes(String(data.gst_percent))) {
                $('#gstSelect').val('other');
                $('#gstOtherContainer').show();
                $('#gstOtherInput').val(data.gst_percent);
            } else {
                $('#gstSelect').val(data.gst_percent);
                $('#gstOtherContainer').hide();
            }
            
            $('#statusSelect').val(data.status);
            
            $('.modal-title').text('Edit Goods');
            $('#goodsModal').modal('show');
            
            // Change save button to update
            $('.modal-footer .btn-primary').off('click').on('click', function(e) {
                e.preventDefault();
                updateGoods(id);
            });
        },
        error: function(err) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load goods details.'
            });
        }
    });
}

// ==========================
// UPDATE GOODS
// ==========================
function updateGoods(id) {
    const category = $('#categorySelect').val();
    const description = $('#descriptionInput').val();
    const partCode = $('#partCodeInput').val();
    const weight = $('#weightInput').val();
    const volume = $('#volumeInput').val();
    const length = $('#lengthInput').val();
    const breadth = $('#breadthInput').val();
    const height = $('#heightInput').val();
    const hsnCode = $('#hsnCodeInput').val();
    const uom = $('#uomSelect').val();
    const uomOther = $('#uomOtherInput').val();
    const gst = $('#gstSelect').val();
    const gstOther = $('#gstOtherInput').val();
    const status = $('#statusSelect').val();

    if (!category || !description) {
        Swal.fire({
            icon: 'warning',
            title: 'Missing Fields',
            text: 'Please fill Category and Description.'
        });
        return;
    }

    const data = {
        category_id: category,
        description: description,
        part_code: partCode || description,
        weight: weight || null,
        volume: volume || null,
        length: length || null,
        breadth: breadth || null,
        height: height || null,
        hsn_code: hsnCode,
        uom: uom,
        uom_other: uomOther,
        gst_percent: gst === 'other' ? gstOther : gst,
        status: status
    };

    $.ajax({
        url: `http://localhost:5000/api/goods/${id}`,
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function(response) {
            Swal.fire({
                icon: 'success',
                title: 'Goods Updated',
                text: 'Item successfully updated.',
                confirmButtonColor: '#1f5eff'
            });
            $('#goodsModal').modal('hide');
            $('#goodsTable').DataTable().ajax.reload();
        },
        error: function(err) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to update goods.'
            });
        }
    });
}


