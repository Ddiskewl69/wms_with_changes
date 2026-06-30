/* ============================================================
   NOKIA WMS - shared-nav.js
   Handles sidebar toggle, active states, nested DOA nav, and quick actions.
============================================================ */
$(document).ready(function () {
    const $sidebar = $('.sidebar');
    const activeSection = $sidebar.data('active-section');
    const activePage = $sidebar.data('active-page');

    function restoreActiveSubmenu() {
        if ($sidebar.hasClass('collapsed') || !activeSection) return;

        const $parentSubmenu = $sidebar
            .find(`.has-submenu[data-section="${activeSection}"] > .submenu`);
        $parentSubmenu.addClass('active');

        if (activePage === 'doa-list' || activePage === 'raise-doa') {
            const $doaParent = $sidebar.find('.has-sub-submenu[data-page="doa-list"]');
            $doaParent.addClass('active-sub-parent');
            $doaParent.children('.sub-submenu').addClass('active');
        }
    }

    $('#toggleSidebar')
        .off('click.wmsNav')
        .on('click.wmsNav', function () {
            $sidebar.toggleClass('collapsed');
            restoreActiveSubmenu();
        });

    $('.menu-title')
        .off('click.wmsNav')
        .on('click.wmsNav', function () {
            const $parent = $(this).closest('.has-submenu');
            const $submenu = $parent.children('.submenu');

            if ($sidebar.hasClass('collapsed')) return;

            $('.has-submenu').not($parent).children('.submenu').removeClass('active');
            $submenu.toggleClass('active');

            if ($parent.hasClass('active-parent')) {
                $submenu.addClass('active');
                restoreActiveSubmenu();
            }
        });

    $('#quickActionToggle')
        .off('click.wmsQuickAction')
        .on('click.wmsQuickAction', function (event) {
            event.stopPropagation();
            $('#quickActionMenu').toggleClass('show');
            $(this).attr('aria-expanded', $('#quickActionMenu').hasClass('show'));
        });

    $(document)
        .off('click.wmsQuickAction')
        .on('click.wmsQuickAction', function () {
            $('#quickActionMenu').removeClass('show');
            $('#quickActionToggle').attr('aria-expanded', 'false');
        });

    $('#quickActionMenu')
        .off('click.wmsQuickAction')
        .on('click.wmsQuickAction', function (event) {
            event.stopPropagation();
        });

    $('.action-btn').each(function () {
        const label = $(this).text().trim().toUpperCase().replace(/\s+/g, ' ');
        const routes = {
            'DOA': '../templates/doa-list.html',
            'GRN': '../templates/grn.html',
            'STN': '../templates/stn.html',
            'DC-IN': '../templates/dc-in.html',
            'DC IN': '../templates/dc-in.html',
            'DC-OUT': '../templates/dc-out.html',
            'DC OUT': '../templates/dc-out.html',
            'IUT': '../templates/iut.html'
        };
        if (routes[label]) $(this).attr('data-route', routes[label]);
    });

    $('.action-btn')
        .off('click.wmsRoute')
        .on('click.wmsRoute', function (event) {
            const route = $(this).data('route');
            if (route) {
                event.stopImmediatePropagation();
                window.location.href = route;
            }
        });

    restoreActiveSubmenu();
});
