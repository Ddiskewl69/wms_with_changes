$(document).ready(function () {
// ==========================
    // DATATABLE
    // ==========================

    const table = $('#goodsTable').DataTable({

        pageLength: 10,

        responsive: true,

        lengthChange: false,

        language: {
            search: "",
            searchPlaceholder: "Search goods..."
        }

    });

    // ==========================
    // SAVE GOODS
    // ==========================

    $('.modal-footer .btn-primary').on('click', function () {

        let category = $('select').eq(0).val();
        let articleId = $('input').eq(0).val();
        let weight = $('input').eq(1).val();

        let description = $('input').eq(2).val();

        let uom = $('select').eq(1).val();

        if (
            articleId.trim() === '' ||
            description.trim() === ''
        ) {

            Swal.fire({

                icon: 'warning',

                title: 'Missing Fields',

                text: 'Please fill all required fields.'

            });

            return;
        }

        table.row.add([

            articleId,

            description,

            category,

            weight + ' Kg',

            '0.00 mÂ³',

            uom,

            `<span class="status active">
                Active
            </span>`,

            `
            <button class="btn btn-light btn-sm edit-btn">
                <i class="bi bi-pencil"></i>
            </button>

            <button class="btn btn-light btn-sm view-btn">
                <i class="bi bi-eye"></i>
            </button>
            `

        ]).draw();

        Swal.fire({

            icon: 'success',

            title: 'Goods Added',

            text: 'New item successfully created.',

            confirmButtonColor: '#1f5eff'

        });

        $('#goodsForm')[0].reset();

        $('#goodsModal').modal('hide');

    });

    // ==========================
    // VIEW BUTTON
    // ==========================

    $('#goodsTable tbody').on(
        'click',
        '.view-btn',
        function () {

            const rowData =
                table.row(
                    $(this).parents('tr')
                ).data();

            Swal.fire({

                title: rowData[1],

                html: `
                    <b>Article ID:</b> ${rowData[0]}<br>
                    <b>Category:</b> ${rowData[2]}<br>
                    <b>Weight:</b> ${rowData[3]}<br>
                    <b>UOM:</b> ${rowData[5]}
                `,

                confirmButtonColor: '#1f5eff'

            });

        }
    );

    // ==========================
    // EDIT BUTTON
    // ==========================

    $('#goodsTable tbody').on(
        'click',
        '.edit-btn',
        function () {

            const row =
                table.row(
                    $(this).parents('tr')
                );

            const data = row.data();

            Swal.fire({

                title: 'Edit Description',

                input: 'text',

                inputValue: data[1],

                showCancelButton: true,

                confirmButtonColor: '#1f5eff'

            }).then((result) => {

                if (result.isConfirmed) {

                    data[1] = result.value;

                    row.data(data).draw();

                    Swal.fire({

                        icon: 'success',

                        title: 'Updated'

                    });

                }

            });

        }
    );

    // ==========================
    // KPI ANIMATION
    // ==========================

    animateNumbers();

});


/* ==========================
NUMBER COUNTER
========================== */

function animateNumbers() {

    $('.stat-card h3').each(function () {

        let $this = $(this);

        let finalValue =
            parseInt(
                $this.text()
            );

        $({
            Counter: 0
        }).animate({

            Counter: finalValue

        }, {

            duration: 1000,

            easing: 'swing',

            step: function () {

                $this.text(
                    Math.ceil(this.Counter)
                );

            }

        });

    });

}


/* ==========================
CARD HOVER EFFECT
========================== */

$('.stat-card').hover(

    function () {

        $(this).addClass('shadow');

    },

    function () {

        $(this).removeClass('shadow');

    }

);


/* ==========================
REFRESH BUTTON (future)
========================== */

function refreshGoods() {

    Swal.fire({

        icon: 'info',

        title: 'Refreshing',

        text: 'Fetching latest inventory...',

        timer: 1500,

        showConfirmButton: false

    });

}


/* ==========================
EXPORT CSV (future)
========================== */

function exportGoodsCSV() {

    Swal.fire({

        icon: 'success',

        title: 'Export Started',

        text: 'CSV download will begin shortly.'

    });

}


