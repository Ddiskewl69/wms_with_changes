/* ============================================================
   GRN  —  grn.js
   Supports two modes via URL query parameters:
     • grn.html?mode=independent  (default — full form)
     • grn.html?mode=doa&id=DOA-0001  (DOA workflow — hide pre-collected fields)
============================================================ */

$(document).ready(function () {

    /* ── Read query params ── */
    const params = new URLSearchParams(window.location.search);
    const mode   = params.get('mode') || 'independent';
    const doaId  = params.get('id')   || '';

    /* ── Apply mode ── */
    if (mode === 'doa' && doaId) {
        // Show DOA-mode UI
        document.getElementById('doaModeBanner').style.display = '';
        document.getElementById('doaRefLabel').textContent     = doaId;

        document.getElementById('grnPageTitle').textContent    = 'GRN (DOA)';
        document.getElementById('grnPageSubtitle').textContent =
            'Goods Receipt Note — continuing DOA workflow';

        document.getElementById('grnBackBtn').style.display   = '';
        document.getElementById('grnBreadcrumb').style.display = '';

        // Hide fields already collected in DOA
        document.querySelectorAll('.doa-hidden-section').forEach(el => {
            el.style.display = 'none';
        });

    } else {
        // Independent mode — full form, no banners
        document.getElementById('doaModeBanner').style.display  = 'none';
        document.getElementById('grnBackBtn').style.display     = 'none';
        document.getElementById('grnBreadcrumb').style.display  = 'none';

        document.querySelectorAll('.doa-hidden-section').forEach(el => {
            el.style.display = '';
        });
    }

    /* ── Save Draft ── */
    $('.btn-light').on('click', function () {
        Swal.fire({
            icon: 'success',
            title: 'Draft Saved',
            text: 'Your GRN draft has been saved.',
            confirmButtonColor: '#315fdc',
            timer: 2000,
            showConfirmButton: false,
        });
    });

    /* ── Submit GRN ── */
    $('#grnForm').on('submit', function (e) {
        e.preventDefault();
        const grnNumber = 'GRN-2026-' + Math.floor(1000 + Math.random() * 9000);
        Swal.fire({
            icon: 'success',
            title: 'GRN Submitted',
            html: `<div style="text-align:center">
                       <h4 style="color:#315fdc">${grnNumber}</h4>
                       <p>GRN has been recorded successfully.</p>
                       ${mode === 'doa' ? `<p style="font-size:.88rem; color:#667085;">DOA reference: <strong>${doaId}</strong></p>` : ''}
                   </div>`,
            confirmButtonColor: '#315fdc',
        }).then(() => {
            if (mode === 'doa') {
                window.location.href = '../templates/doa-list.html';
            } else {
                document.getElementById('grnForm').reset();
            }
        });
    });

});
