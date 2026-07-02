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
    var customerTable = $('#customerTable').DataTable({
        'ajax': {
            'url': 'http://localhost:5000/api/customers',
            'dataSrc': ''
        },
        'columns': [
            { 'data': 'customer_id' },
            { 'data': 'account_name' },
            { 'data': 'ledger_type' },
            { 'data': 'billing_name' },
            { 
                'data': 'vendor_code',
                'render': function(data) {
                    return data ? data : 'N/A';
                }
            },
            { 'data': 'state' },
            { 
                'data': 'work_type',
                'render': function(data) {
                    return data ? data : 'N/A';
                }
            },
            { 
                'data': 'gst_number',
                'render': function(data) {
                    return data ? data : 'N/A';
                }
            },
            { 
                'data': 'pan_number',
                'render': function(data) {
                    return data ? data : 'N/A';
                }
            },
            { 
                'data': 'mobile_number',
                'render': function(data) {
                    return data ? data : 'N/A';
                }
            },
            { 
                'data': 'account_details',
                'render': function(data) {
                    return data ? data : 'N/A';
                }
            },
            { 'data': 'correspondence_address' },
            { 'data': 'address' },
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
        'order': [[13, 'desc']], // Order by created_at DESC by default
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

    bindCustomLengthSelector(customerTable);

    // ==========================
    // LOAD DROPDOWNS
    // ==========================
    loadAccounts();
    loadStates();

    // ==========================
    // FORM INTERACTION HANDLERS
    // ==========================

    // Account Select dynamic change
    $('#accountSelect').on('change', function() {
        if ($(this).val() === 'other') {
            $('#accountOtherContainer').show();
            $('#accountOtherInput').prop('required', true);
        } else {
            $('#accountOtherContainer').hide();
            $('#accountOtherInput').prop('required', false).val('');
        }
    });

    // Ledger Type dynamic change
    $('#ledgerTypeSelect').on('change', function() {
        if ($(this).val() === 'Other') {
            $('#ledgerTypeOtherContainer').show();
            $('#ledgerTypeOtherInput').prop('required', true);
        } else {
            $('#ledgerTypeOtherContainer').hide();
            $('#ledgerTypeOtherInput').prop('required', false).val('');
        }
    });

    // State Select dynamic change
    $('#stateSelect').on('change', function() {
        if ($(this).val() === 'other') {
            $('#stateOtherContainer').show();
            $('#stateOtherInput').prop('required', true);
        } else {
            $('#stateOtherContainer').hide();
            $('#stateOtherInput').prop('required', false).val('');
        }
    });

    // Same Address Checkbox change
    $('#sameAsCorrespondence').on('change', function() {
        if ($(this).is(':checked')) {
            $('#permanentAddressInput').val($('#correspondenceAddressInput').val());
            $('#permanentAddressInput').prop('readonly', true);
        } else {
            $('#permanentAddressInput').prop('readonly', false);
        }
    });

    // Correspondence Address typing sync
    $('#correspondenceAddressInput').on('input', function() {
        if ($('#sameAsCorrespondence').is(':checked')) {
            $('#permanentAddressInput').val($(this).val());
        }
    });

    // ==========================
    // ADD CUSTOMER BUTTON
    // ==========================
    $('#addCustomerBtn, #addCustomerBtnBottom').click(function() {
        resetForm();
        $('#customerModalLabel').text('Add Customer Ledger');
        $('#saveCustomerBtn').off('click').on('click', function(e) {
            e.preventDefault();
            saveCustomer();
        });
        $('#customerModal').modal('show');
    });

    // ==========================
    // EDIT & DELETE ACTIONS (DELEGATED)
    // ==========================
    $(document).on('click', '.edit-btn', function() {
        const id = $(this).data('id');
        editCustomer(id);
    });

    $(document).on('click', '.delete-btn', function() {
        const id = $(this).data('id');
        deleteCustomer(id);
    });
});

// ==========================
// LOAD DATA FROM APIs
// ==========================
function loadAccounts() {
    $.ajax({
        url: 'http://localhost:5000/api/accounts',
        method: 'GET',
        success: function(data) {
            $('#accountSelect').empty();
            $('#accountSelect').append('<option value="">Select Account Name</option>');
            data.forEach(acc => {
                $('#accountSelect').append(`<option value="${acc.account_name}">${acc.account_name}</option>`);
            });
            $('#accountSelect').append('<option value="other">Other (Add Custom)</option>');
        },
        error: function(err) {
            console.error('Error loading accounts:', err);
        }
    });
}

// ==========================
// LOAD STATES
// ==========================
function loadStates() {
    $.ajax({
        url: 'http://localhost:5000/api/states',
        method: 'GET',
        success: function(data) {
            $('#stateSelect').empty();
            $('#stateSelect').append('<option value="">Select State</option>');
            data.forEach(st => {
                $('#stateSelect').append(`<option value="${st.state_name}">${st.state_name}</option>`);
            });
            $('#stateSelect').append('<option value="other">Other (Add Custom)</option>');
        },
        error: function(err) {
            console.error('Error loading states:', err);
        }
    });
}

// ==========================
// RESET FORM
// ==========================
function resetForm() {
    $('#customerForm')[0].reset();
    
    // Hide custom input sections
    $('#accountOtherContainer').hide();
    $('#accountOtherInput').val('').prop('required', false);
    
    $('#ledgerTypeOtherContainer').hide();
    $('#ledgerTypeOtherInput').val('').prop('required', false);
    
    $('#stateOtherContainer').hide();
    $('#stateOtherInput').val('').prop('required', false);
    
    $('#permanentAddressInput').prop('readonly', false);
    $('#sameAsCorrespondence').prop('checked', false);
}

// ==========================
// SAVE (POST CREATE)
// ==========================
function saveCustomer() {
    if (!$('#customerForm')[0].checkValidity()) {
        $('#customerForm')[0].reportValidity();
        return;
    }

    const isOtherAccount = $('#accountSelect').val() === 'other';
    const accountName = isOtherAccount ? $('#accountOtherInput').val().trim() : $('#accountSelect').val();

    const isOtherLedger = $('#ledgerTypeSelect').val() === 'Other';
    const ledgerType = isOtherLedger ? $('#ledgerTypeOtherInput').val().trim() : $('#ledgerTypeSelect').val();

    const isOtherState = $('#stateSelect').val() === 'other';
    const stateName = isOtherState ? $('#stateOtherInput').val().trim() : $('#stateSelect').val();

    const postData = {
        account_name: accountName,
        is_other_account: isOtherAccount,
        ledger_type: ledgerType,
        billing_name: $('#billingNameInput').val().trim(),
        vendor_code: $('#vendorCodeInput').val().trim() || null,
        state: stateName,
        is_other_state: isOtherState,
        work_type: $('#workTypeInput').val().trim() || null,
        gst_number: $('#gstNumberInput').val().trim() || null,
        pan_number: $('#panNumberInput').val().trim() || null,
        mobile_number: $('#mobileNumberInput').val().trim() || null,
        account_details: $('#accountDetailsInput').val().trim() || null,
        correspondence_address: $('#correspondenceAddressInput').val().trim(),
        address: $('#permanentAddressInput').val().trim()
    };

    $.ajax({
        url: 'http://localhost:5000/api/customers',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(postData),
        success: function(response) {
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: `Customer ledger created successfully! Generated ID: ${response.customer_id}`,
                confirmButtonColor: '#1f5eff'
            });
            $('#customerModal').modal('hide');
            $('#customerTable').DataTable().ajax.reload();
            
            // Reload dropdown lists in case a new other was created
            if (isOtherAccount) loadAccounts();
            if (isOtherState) loadStates();
        },
        error: function(err) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to create customer ledger: ' + (err.responseJSON?.error || err.statusText)
            });
        }
    });
}

// ==========================
// EDIT CUSTOMER Details
// ==========================
function editCustomer(id) {
    $.ajax({
        url: `http://localhost:5000/api/customers/${id}`,
        method: 'GET',
        success: function(data) {
            resetForm();
            $('#customerModalLabel').text('Edit Customer Ledger');

            // Find if account_name is standard or not.
            // Temporarily append it to select options if it's not present
            if ($(`#accountSelect option[value="${data.account_name}"]`).length === 0) {
                // Not standard, load as "other" option
                $('#accountSelect').val('other');
                $('#accountOtherContainer').show();
                $('#accountOtherInput').val(data.account_name).prop('required', true);
            } else {
                $('#accountSelect').val(data.account_name);
            }

            // Ledger type matching
            if (data.ledger_type === 'Customer') {
                $('#ledgerTypeSelect').val('Customer');
            } else {
                $('#ledgerTypeSelect').val('Other');
                $('#ledgerTypeOtherContainer').show();
                $('#ledgerTypeOtherInput').val(data.ledger_type).prop('required', true);
            }

            // State matching
            if ($(`#stateSelect option[value="${data.state}"]`).length === 0) {
                $('#stateSelect').val('other');
                $('#stateOtherContainer').show();
                $('#stateOtherInput').val(data.state).prop('required', true);
            } else {
                $('#stateSelect').val(data.state);
            }

            // Set other inputs
            $('#billingNameInput').val(data.billing_name);
            $('#vendorCodeInput').val(data.vendor_code || '');
            $('#workTypeInput').val(data.work_type || '');
            $('#gstNumberInput').val(data.gst_number || '');
            $('#panNumberInput').val(data.pan_number || '');
            $('#mobileNumberInput').val(data.mobile_number || '');
            $('#accountDetailsInput').val(data.account_details || '');
            $('#correspondenceAddressInput').val(data.correspondence_address);
            $('#permanentAddressInput').val(data.address);

            if (data.correspondence_address === data.address && data.correspondence_address !== '') {
                $('#sameAsCorrespondence').prop('checked', true);
                $('#permanentAddressInput').prop('readonly', true);
            }

            $('#saveCustomerBtn').off('click').on('click', function(e) {
                e.preventDefault();
                updateCustomer(id);
            });

            $('#customerModal').modal('show');
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
function updateCustomer(id) {
    if (!$('#customerForm')[0].checkValidity()) {
        $('#customerForm')[0].reportValidity();
        return;
    }

    const isOtherAccount = $('#accountSelect').val() === 'other';
    const accountName = isOtherAccount ? $('#accountOtherInput').val().trim() : $('#accountSelect').val();

    const isOtherLedger = $('#ledgerTypeSelect').val() === 'Other';
    const ledgerType = isOtherLedger ? $('#ledgerTypeOtherInput').val().trim() : $('#ledgerTypeSelect').val();

    const isOtherState = $('#stateSelect').val() === 'other';
    const stateName = isOtherState ? $('#stateOtherInput').val().trim() : $('#stateSelect').val();

    const putData = {
        account_name: accountName,
        is_other_account: isOtherAccount,
        ledger_type: ledgerType,
        billing_name: $('#billingNameInput').val().trim(),
        vendor_code: $('#vendorCodeInput').val().trim() || null,
        state: stateName,
        is_other_state: isOtherState,
        work_type: $('#workTypeInput').val().trim() || null,
        gst_number: $('#gstNumberInput').val().trim() || null,
        pan_number: $('#panNumberInput').val().trim() || null,
        mobile_number: $('#mobileNumberInput').val().trim() || null,
        account_details: $('#accountDetailsInput').val().trim() || null,
        correspondence_address: $('#correspondenceAddressInput').val().trim(),
        address: $('#permanentAddressInput').val().trim()
    };

    $.ajax({
        url: `http://localhost:5000/api/customers/${id}`,
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(putData),
        success: function() {
            Swal.fire({
                icon: 'success',
                title: 'Updated',
                text: 'Customer ledger updated successfully!',
                confirmButtonColor: '#1f5eff'
            });
            $('#customerModal').modal('hide');
            $('#customerTable').DataTable().ajax.reload();

            // Reload dropdown lists in case a new other was created
            if (isOtherAccount) loadAccounts();
            if (isOtherState) loadStates();
        },
        error: function(err) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to update customer: ' + (err.responseJSON?.error || err.statusText)
            });
        }
    });
}

// ==========================
// DELETE
// ==========================
function deleteCustomer(id) {
    Swal.fire({
        title: 'Are you sure?',
        text: 'You want to delete this customer ledger record?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `http://localhost:5000/api/customers/${id}`,
                method: 'DELETE',
                success: function() {
                    Swal.fire({
                        icon: 'success',
                        title: 'Deleted!',
                        text: 'Customer ledger record has been deleted.',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    $('#customerTable').DataTable().ajax.reload();
                },
                error: function(err) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Failed to delete record: ' + (err.responseJSON?.error || err.statusText)
                    });
                }
            });
        }
    });
}
