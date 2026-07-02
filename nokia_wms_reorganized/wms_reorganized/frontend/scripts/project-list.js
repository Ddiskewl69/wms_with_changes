// ==========================
// LOAD STORES DROPDOWN
// ==========================
function loadStoreDropdown(selectedValue) {
    $.ajax({
        url: 'http://localhost:5000/api/stores',
        method: 'GET',
        success: function(stores) {
            var $select = $('#store');
            $select.empty().append('<option value="">-- Select Store --</option>');
            stores.forEach(function(store) {
                var opt = $('<option>').val(store.store_name).text(store.store_name);
                if (selectedValue && store.store_name === selectedValue) {
                    opt.prop('selected', true);
                }
                $select.append(opt);
            });
        },
        error: function() {
            console.warn('Could not load stores from API. Store dropdown will be empty.');
        }
    });
}

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

$(document).ready(function() {
    // Load stores for dropdown on page load
    loadStoreDropdown();

    // Initialize DataTable
    var projectTable = $('#projectTable').DataTable({
        'ajax': {
            'url': 'http://localhost:5000/api/projects',
            'dataSrc': ''
        },
        'columns': [
            { 'data': 'project_name' },
            { 'data': 'company_name' },
            { 'data': 'store' },
            { 'data': 'dc_out_slug' },
            { 'data': 'stn_slug' },
            { 'data': 'dc_in_slug' },
            { 'data': 'inward_slug' },
            { 'data': 'doa_slug' },
            { 'data': 'project_type' },
            { 'data': 'project_invoice_type' },
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
                }
            }
        ],
        'order': [[0, 'asc']],
        'dom': '<"d-flex justify-content-between align-items-center flex-wrap gap-2"lB><"table-responsive"t>ip',
        'lengthMenu': [[10, 20, 25, -1], ['10', '20', '25', 'Custom']],
        'lengthChange': true,
        'pageLength': 10,
        'buttons': [
            {
                extend: 'copy',
                text: '<i class="bi bi-clipboard"></i> Copy',
                className: 'btn btn-secondary btn-sm'
            },
            {
                extend: 'csv',
                text: '<i class="bi bi-file-earmark-spreadsheet"></i> CSV',
                className: 'btn btn-success btn-sm'
            },
            {
                extend: 'excel',
                text: '<i class="bi bi-file-earmark-excel"></i> Excel',
                className: 'btn btn-success btn-sm'
            },
            {
                extend: 'pdf',
                text: '<i class="bi bi-file-earmark-pdf"></i> PDF',
                className: 'btn btn-danger btn-sm'
            },
            {
                extend: 'print',
                text: '<i class="bi bi-printer"></i> Print',
                className: 'btn btn-secondary btn-sm'
            }
        ]
    });

    bindCustomLengthSelector(projectTable);

    // Modal instance
    var projectModal = new bootstrap.Modal(document.getElementById('projectModal'));

    // Add Project button click
    $('#addProjectBtn, #addProjectBtnBottom').click(function() {
        resetForm();
        loadStoreDropdown(); // refresh store dropdown
        $('#projectModalLabel').text('Add Project');
        projectModal.show();
    });

    // Company Name radio button change
    $('input[name="companyName"]').change(function() {
        if ($(this).val() === 'Other') {
            $('#companyNameOther').show();
        } else {
            $('#companyNameOther').hide();
        }
    });

    // Project Type radio button change
    $('input[name="projectType"]').change(function() {
        if ($(this).val() === 'Other') {
            $('#projectTypeOther').show();
        } else {
            $('#projectTypeOther').hide();
        }
    });

    // Invoice Type radio button change
    $('input[name="invoiceType"]').change(function() {
        if ($(this).val() === 'Other') {
            $('#invoiceTypeOther').show();
        } else {
            $('#invoiceTypeOther').hide();
        }
    });

    // Save Project button click
    $('#saveProjectBtn').click(function() {
        if (!validateForm()) {
            return;
        }

        var projectId = $('#projectId').val();
        var companyName = $('input[name="companyName"]:checked').val();
        if (companyName === 'Other') {
            companyName = $('#companyNameOther').val();
        }

        var projectType = $('input[name="projectType"]:checked').val();
        if (projectType === 'Other') {
            projectType = $('#projectTypeOther').val();
        }

        var invoiceType = $('input[name="invoiceType"]:checked').val();
        if (invoiceType === 'Other') {
            invoiceType = $('#invoiceTypeOther').val();
        }

        var projectData = {
            project_name: $('#projectName').val(),
            company_name: companyName,
            store: $('#store').val(),
            dc_out_slug: $('#dcOutSlug').val(),
            stn_slug: $('#stnSlug').val(),
            dc_in_slug: $('#dcInSlug').val(),
            inward_slug: $('#inwardSlug').val(),
            doa_slug: $('#doaSlug').val(),
            project_type: projectType,
            project_invoice_type: invoiceType
        };

        var url = 'http://localhost:5000/api/projects';
        var method = 'POST';

        if (projectId) {
            url += '/' + projectId;
            method = 'PUT';
        }

        $.ajax({
            url: url,
            method: method,
            contentType: 'application/json',
            data: JSON.stringify(projectData),
            success: function(response) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: projectId ? 'Project updated successfully!' : 'Project added successfully!',
                    timer: 1500,
                    showConfirmButton: false
                });
                projectModal.hide();
                projectTable.ajax.reload();
            },
            error: function(error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error saving project: ' + (error.responseJSON?.error || error.statusText)
                });
            }
        });
    });

    // Edit button click (delegated event)
    $(document).on('click', '.edit-btn', function() {
        var projectId = $(this).data('id');
        
        $.ajax({
            url: 'http://localhost:5000/api/projects/' + projectId,
            method: 'GET',
            success: function(response) {
                $('#projectId').val(response.id);
                $('#projectName').val(response.project_name);
                // Load stores first, then set the selected value
                loadStoreDropdown(response.store);
                $('#dcOutSlug').val(response.dc_out_slug);
                $('#stnSlug').val(response.stn_slug);
                $('#dcInSlug').val(response.dc_in_slug);
                $('#inwardSlug').val(response.inward_slug);
                $('#doaSlug').val(response.doa_slug);

                // Set company name
                if (response.company_name === 'Nokia-Haryana') {
                    $('#companyNokia').prop('checked', true);
                    $('#companyNameOther').hide();
                } else {
                    $('#companyOther').prop('checked', true);
                    $('#companyNameOther').show().val(response.company_name);
                }

                // Set project type
                var projectTypes = ['Telecom', 'Warehouse', 'Transport'];
                if (projectTypes.includes(response.project_type)) {
                    $('input[name="projectType"][value="' + response.project_type + '"]').prop('checked', true);
                    $('#projectTypeOther').hide();
                } else {
                    $('#typeOther').prop('checked', true);
                    $('#projectTypeOther').show().val(response.project_type);
                }

                // Set invoice type
                var invoiceTypes = ['Indian', 'Western'];
                if (invoiceTypes.includes(response.project_invoice_type)) {
                    $('input[name="invoiceType"][value="' + response.project_invoice_type + '"]').prop('checked', true);
                    $('#invoiceTypeOther').hide();
                } else {
                    $('#invoiceOther').prop('checked', true);
                    $('#invoiceTypeOther').show().val(response.project_invoice_type);
                }

                $('#projectModalLabel').text('Edit Project');
                projectModal.show();
            },
            error: function(error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error loading project: ' + (error.responseJSON?.error || error.statusText)
                });
            }
        });
    });

    // Delete button click (delegated event)
    $(document).on('click', '.delete-btn', function() {
        var projectId = $(this).data('id');
        
        Swal.fire({
            title: 'Are you sure?',
            text: 'You want to delete this project?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: 'http://localhost:5000/api/projects/' + projectId,
                    method: 'DELETE',
                    success: function(response) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Deleted!',
                            text: 'Project has been deleted.',
                            timer: 1500,
                            showConfirmButton: false
                        });
                        projectTable.ajax.reload();
                    },
                    error: function(error) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Error deleting project: ' + (error.responseJSON?.error || error.statusText)
                        });
                    }
                });
            }
        });
    });

    // Reset form function
    function resetForm() {
        $('#projectForm')[0].reset();
        $('#projectId').val('');
        $('#companyNameOther').hide();
        $('#projectTypeOther').hide();
        $('#invoiceTypeOther').hide();
        $('#companyNokia').prop('checked', true);
        $('#typeTelecom').prop('checked', true);
        $('#invoiceIndian').prop('checked', true);
    }

    // Validate form function
    function validateForm() {
        var projectName = $('#projectName').val().trim();
        var companyName = $('input[name="companyName"]:checked').val();
        var projectType = $('input[name="projectType"]:checked').val();
        var invoiceType = $('input[name="invoiceType"]:checked').val();

        if (!projectName) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Project Name is required'
            });
            return false;
        }

        if (companyName === 'Other' && !$('#companyNameOther').val().trim()) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Company Name is required when Other is selected'
            });
            return false;
        }

        if (projectType === 'Other' && !$('#projectTypeOther').val().trim()) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Project Type is required when Other is selected'
            });
            return false;
        }

        if (invoiceType === 'Other' && !$('#invoiceTypeOther').val().trim()) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Invoice Type is required when Other is selected'
            });
            return false;
        }

        return true;
    }
});
