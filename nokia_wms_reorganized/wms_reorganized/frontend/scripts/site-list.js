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

function emptyValue(data) {
    return data ? data : 'N/A';
}

$(document).ready(function () {
    const siteTable = $('#siteTable').DataTable({
        ajax: {
            url: 'http://localhost:5000/api/sites',
            dataSrc: ''
        },
        columns: [
            { data: 'site_name', render: emptyValue },
            { data: 'state', render: emptyValue },
            { data: 'district', render: emptyValue },
            { data: 'city_town', render: emptyValue },
            { data: 'pincode', render: emptyValue },
            { data: 'contact_person', render: emptyValue },
            { data: 'contact_no', render: emptyValue },
            { data: 'location', render: emptyValue },
            { data: 'address', render: emptyValue },
            { data: 'address_2', render: emptyValue }
        ],
        order: [[0, 'asc']],
        scrollX: true,
        dom: '<"d-flex justify-content-between align-items-center flex-wrap gap-2"lB><"table-responsive"t>ip',
        lengthMenu: [[10, 20, 25, -1], ['10', '20', '25', 'Custom']],
        lengthChange: true,
        pageLength: 10,
        buttons: [
            { extend: 'copy', text: '<i class="bi bi-clipboard"></i> Copy', className: 'btn btn-secondary btn-sm me-1' },
            { extend: 'csv', text: '<i class="bi bi-file-earmark-spreadsheet"></i> CSV', className: 'btn btn-success btn-sm me-1' },
            { extend: 'excel', text: '<i class="bi bi-file-earmark-excel"></i> Excel', className: 'btn btn-success btn-sm me-1' },
            { extend: 'pdf', text: '<i class="bi bi-file-earmark-pdf"></i> PDF', className: 'btn btn-danger btn-sm me-1' },
            { extend: 'print', text: '<i class="bi bi-printer"></i> Print', className: 'btn btn-secondary btn-sm' }
        ]
    });

    bindCustomLengthSelector(siteTable);
    loadSiteStates();

    const siteModal = new bootstrap.Modal(document.getElementById('siteModal'));

    $('#addSiteBtn').click(function () {
        resetSiteForm();
        loadSiteStates();
        siteModal.show();
    });

    $('#sameAsAddressCheck').change(function () {
        if ($(this).is(':checked')) {
            $('#address2Input').val($('#addressInput').val()).prop('readonly', true);
        } else {
            $('#address2Input').prop('readonly', false).val('');
        }
    });

    $('#addressInput').on('input', function () {
        if ($('#sameAsAddressCheck').is(':checked')) {
            $('#address2Input').val($(this).val());
        }
    });

    $('#saveSiteBtn').click(function () {
        saveSite(siteTable, siteModal);
    });
});

function loadSiteStates() {
    $.ajax({
        url: 'http://localhost:5000/api/states',
        method: 'GET',
        success: function (data) {
            const $select = $('#siteStateSelect');
            const selectedValue = $select.val();
            $select.empty().append('<option value="">Select State</option>');

            data.forEach(function (state) {
                $select.append(`<option value="${state.state_name}">${state.state_name}</option>`);
            });

            if (selectedValue) {
                $select.val(selectedValue);
            }
        },
        error: function (err) {
            console.error('Error loading states:', err);
        }
    });
}

function resetSiteForm() {
    $('#siteForm')[0].reset();
    $('#address2Input').prop('readonly', false);
}

function saveSite(siteTable, siteModal) {
    const form = $('#siteForm')[0];
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const siteData = {
        site_name: $('#siteNameInput').val().trim(),
        state: $('#siteStateSelect').val(),
        district: $('#districtInput').val().trim(),
        city_town: $('#cityTownInput').val().trim(),
        pincode: $('#pincodeInput').val().trim(),
        contact_person: $('#contactPersonInput').val().trim(),
        contact_no: $('#contactNoInput').val().trim(),
        location: $('#locationInput').val().trim(),
        address: $('#addressInput').val().trim(),
        address_2: $('#address2Input').val().trim() || null
    };

    $.ajax({
        url: 'http://localhost:5000/api/sites',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(siteData),
        success: function () {
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Site saved successfully!',
                timer: 1500,
                showConfirmButton: false
            });
            siteModal.hide();
            siteTable.ajax.reload();
        },
        error: function (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to save site: ' + (err.responseJSON?.error || err.statusText)
            });
        }
    });
}
