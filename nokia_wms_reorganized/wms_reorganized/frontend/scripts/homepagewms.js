$(document).ready(function () {
    $('#doaTable').DataTable({
        pageLength: 5,
        responsive: true,
        lengthChange: false,
        ordering: true,
        language: {
            search: '',
            searchPlaceholder: 'Search DOA...'
        }
    });

    $('.kpi-card').on('click', function () {
        $('.kpi-card').removeClass('selected');
        $(this).addClass('selected');
    });

    $('#doaTable tbody').on('click', 'tr', function () {
        const rowData = $('#doaTable').DataTable().row(this).data();
        Swal.fire({
            title: rowData[0],
            html: `
                <div style="text-align:left">
                    <p><strong>Customer:</strong> ${rowData[1]}</p>
                    <p><strong>Material:</strong> ${rowData[2]}</p>
                    <p><strong>Status:</strong> ${rowData[3]}</p>
                    <p><strong>Date:</strong> ${rowData[4]}</p>
                </div>
            `,
            confirmButtonColor: '#2563eb'
        });
    });

    $('.big-blue-card').on('click', function () {
        window.location.href = '../templates/transaction-list.html';
    });

    $('.blue-btn, .orange-btn').on('click', function () {
        const label = $(this).text().trim().toLowerCase();
        if (label.includes('project')) window.location.href = '../templates/project-list.html';
        else if (label.includes('cost')) window.location.href = '../templates/cost-center-list.html';
        else if (label.includes('goods')) window.location.href = '../templates/goods-master.html';
        else if (label.includes('summary')) window.location.href = '../templates/stock-summary.html';
        else if (label.includes('report')) window.location.href = '../templates/stock-report.html';
        else if (label.includes('aging')) window.location.href = '../templates/stock-aging.html';
    });

    animateKPI();
});

function animateKPI() {
    $('.kpi-card h2').each(function () {
        const $this = $(this);
        const count = parseInt($this.text(), 10);
        $({ Counter: 0 }).animate({ Counter: count }, {
            duration: 900,
            easing: 'swing',
            step: function () {
                $this.text(Math.ceil(this.Counter));
            }
        });
    });
}

function openSidebar() {
    $('.sidebar').addClass('show');
}

function closeSidebar() {
    $('.sidebar').removeClass('show');
}

function refreshDashboard() {
    Swal.fire({
        title: 'Refreshing',
        text: 'Fetching latest data...',
        timer: 1200,
        icon: 'info',
        showConfirmButton: false
    });
}

function exportReport() {
    Swal.fire({
        icon: 'success',
        title: 'Export Started',
        text: 'Report will be downloaded shortly.'
    });
}
