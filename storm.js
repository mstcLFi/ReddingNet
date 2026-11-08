//storm.js

let saveTimeout;

function scheduleSave(){

    clearTimeout(
        saveTimeout
    );

    saveTimeout =
        setTimeout(
            saveStormData,
            3000
        );
}

function renderHulpverleners(){

    const table =
        document.getElementById(
            'hulpverlenersTable'
        );

    let html = `

        <tr>

            <th></th>

            <th>
                Aantallen aan boord
            </th>

            <th>
                Aantallen van boord
            </th>

            <th></th>

        </tr>

    `;

    hulpverlenersConfig
        .forEach(item => {

            html += `

                <tr>

                    <td>
                        ${item.label}
                    </td>

                    <td>

                        <input
                            type="number"
                            min="0"
                            id="${item.id}AanBoord"
                            data-field="${item.id}AanBoord">

                    </td>

                    <td>

                        <input
                            type="number"
                            min="0"
                            id="${item.id}VanBoord"
                            data-field="${item.id}VanBoord">

                    </td>

                    <td>

                        <input
                            type="text"
                            id="${item.id}Opmerking"
                            data-field="${item.id}Opmerking">

                    </td>

                </tr>

            `;

        });

    html += `

        <tr>

            <td>

                <input
                    type="text"
                    id="extraHulpverlener"
                    data-field="extraHulpverlener"
                    placeholder="Overig">

            </td>

            <td>

                <input
                    type="number"
                    min="0"
                    id="extraAanBoord"
                    data-field="extraAanBoord">

            </td>

            <td>

                <input
                    type="number"
                    min="0"
                    id="extraVanBoord"
                    data-field="extraVanBoord">

            </td>

            <td>

                <input
                    type="text"
                    id="extraOpmerking"
                    data-field="extraOpmerking">

            </td>

        </tr>

    `;

    table.innerHTML = html;
}


function collectStormData() {

    document
        .querySelectorAll(
            '[data-field]'
        )
        .forEach(field => {

            stormData[
                field.dataset.field
            ] = field.value;

        });

}

async function saveStormData(){

    collectStormData();

    console.log(
        'SAVE',
        stormData
    );



    const { error } =
        await supabaseClient
            .from('storm')
            .update({

                data: stormData

            })
            .eq('id', 1);

    if(error){

        console.error(error);

        return;
    }

    console.log(
        'Storm opgeslagen'
    );
}

async function loadStormData(){

    if(
        document.activeElement &&
        document.activeElement.dataset &&
        document.activeElement.dataset.field
    ){
        return;
    }

    const { data, error } =
        await supabaseClient
            .from('storm')
            .select('data')
            .eq('id', 1)
            .single();

    if(error){

        console.error(error);

        return;
    }

    if(!data || !data.data){
        return;
    }

    Object.assign(
        stormData,
        data.data
    );

    if(
        stormData.slachtofferAantal
    ){
        slachtofferAantal.value =
            stormData.slachtofferAantal;
    }

    updateSlachtoffers();

    document
        .querySelectorAll('.choice-btn')
        .forEach(button => {

            const group =
                button.dataset.group;

            const value =
                button.dataset.value ===
                'true';

            if(
                stormData[group] ===
                undefined
            ){
                return;
            }

            button.classList.remove(
                'selected-yes',
                'selected-no',
                'selected-history'
            );

            if(
                stormData[group] !== value
            ){
                return;
            }

            const isDangerQuestion =
                button.classList.contains(
                    'danger-choice'
                );

            if(group === 'brand_geweest'){

                button.classList.add(
                    'selected-history'
                );

            }else if(isDangerQuestion){

                if(value){

                    button.classList.add(
                        'selected-no'
                    );

                }else{

                    button.classList.add(
                        'selected-yes'
                    );

                }

            }else{

                if(value){

                    button.classList.add(
                        'selected-yes'
                    );

                }else{

                    button.classList.add(
                        'selected-no'
                    );

                }

            }

        });

    document
        .querySelectorAll(
            '[data-field]'
        )
        .forEach(field => {

            const value =
                stormData[
                    field.dataset.field
                ];

            if(
                value !== undefined &&
                value !== null
            ){
                field.value = value;
            }

        });


    if(stormData.gemusterd){

        document
            .getElementById(
                'gemusterdLocatieRow'
            )
            .style.display =
            'table-row';

    }else{

        document
            .getElementById(
                'gemusterdLocatieRow'
            )
            .style.display =
            'none';

    }

    updateOngevallenRows();
    updateMiddelenRows();

    console.log(
        'Storm geladen',
        stormData
    );

    document
        .querySelectorAll('.plan-input')
        .forEach(textarea => {

            textarea.style.height =
                'auto';

            textarea.style.height =
                textarea.scrollHeight + 'px';

        });

}

document
    .querySelectorAll('.plan-input')
    .forEach(textarea => {

        function autoResize(){

            textarea.style.height = 'auto';
            textarea.style.height =
                textarea.scrollHeight + 'px';
        }

        textarea.addEventListener(
            'input',
            autoResize
        );

        autoResize();

    });



const stormData = {};

document
    .querySelectorAll('.choice-btn')
    .forEach(button => {

        button.addEventListener('click', () => {

            const group =
                button.dataset.group;

            const value =
                button.dataset.value === 'true';

            if(group === 'brand_geweest'){

                const active =
                    button.classList.contains(
                        'selected-history'
                    );

                button.classList.remove(
                    'selected-history'
                );

                if(active){

                    stormData[group] = false;

                }else{

                    button.classList.add(
                        'selected-history'
                    );

                    stormData[group] = true;
                }

                saveStormData();

                return;
            }

            document
                .querySelectorAll(
                    `[data-group="${group}"]`
                )
                .forEach(btn => {

                    btn.classList.remove(
                        'selected-yes',
                        'selected-no'
                    );

                });

            const isDangerQuestion =
                button.classList.contains(
                    'danger-choice'
                );

            if(isDangerQuestion){

                if(value){

                    button.classList.add(
                        'selected-no'
                    );

                }else{

                    button.classList.add(
                        'selected-yes'
                    );
                }

            }else{

                if(value){

                    button.classList.add(
                        'selected-yes'
                    );

                }else{

                    button.classList.add(
                        'selected-no'
                    );
                }

            }

            stormData[group] = value;

            saveStormData();

            if(group === "gemusterd"){

                document
                    .getElementById(
                        "gemusterdLocatieRow"
                    )
                    .style.display =
                    value
                        ? "table-row"
                        : "none";
            }

            console.log(stormData);

        });

    });





function updateOngevallenRows(){

    for(let i = 2; i <= 5; i++){

        document
            .getElementById(
                `ongeval${i}Row`
            )
            .style.display =
            'none';
    }

    for(let i = 1; i < 5; i++){

        const current =
            document.getElementById(
                `ongeval${i}`
            );

        if(
            current.value.trim()
        ){

            document
                .getElementById(
                    `ongeval${i + 1}Row`
                )
                .style.display =
                'table-row';

        }else{

            break;
        }
    }
}

for(let i = 1; i <= 5; i++){

    document
        .getElementById(
            `ongeval${i}`
        )
        .addEventListener(
            'input',
            updateOngevallenRows
        );

}


function updateMiddelenRows(){

    for(let i = 2; i <= 5; i++){

        document
            .getElementById(
                `middel${i}Row`
            )
            .style.display =
            'none';
    }

    for(let i = 1; i < 5; i++){

        const current =
            document.getElementById(
                `middel${i}`
            );

        if(
            current.value.trim()
        ){

            document
                .getElementById(
                    `middel${i + 1}Row`
                )
                .style.display =
                'table-row';

        }else{

            break;
        }
    }
}

for(let i = 1; i <= 5; i++){

    document
        .getElementById(
            `middel${i}`
        )
        .addEventListener(
            'input',
            updateMiddelenRows
        );

}

const slachtofferAantal =
    document.getElementById(
        'slachtofferAantal'
    );

const slachtofferTabelBody =
    document.getElementById(
        'slachtofferTabelBody'
    );

function updateSlachtoffers(){

    const bestaandeData = {};

    document
        .querySelectorAll(
            '[id^="slachtoffer_"]'
        )
        .forEach(field => {

            bestaandeData[
                field.id
            ] = field.value;

        });

    const aantal =
        parseInt(
            slachtofferAantal.value
        ) || 0;

    slachtofferTabelBody.innerHTML = '';

    for(let i = 1; i <= aantal; i++){

        slachtofferTabelBody.innerHTML += `

            <tr>

                <td>
                    Slachtoffer ${i}
                </td>

                <td>

                    <input
                        type="text"
                        id="slachtoffer_${i}"
                        data-field="slachtoffer_${i}">

                </td>

            </tr>

        `;

    }

    Object.entries(
        bestaandeData
    )
    .forEach(([id,value]) => {

        const field =
            document.getElementById(
                id
            );

        if(field){

            field.value = value;

        }

    });

    document
        .querySelectorAll(
            '[data-field]'
        )
        .forEach(field => {

            field.addEventListener(
                'input',
                scheduleSave
            );


        });

}

slachtofferAantal
    .addEventListener(
        'input',
        updateSlachtoffers
    );

updateSlachtoffers();

function syncPlanHeights(){

    const leftRows =
        document.querySelectorAll(
            '#leftGrid .grid-row'
        );

    const middleRows =
        document.querySelectorAll(
            '#middleGrid .grid-row'
        );

    if(
        leftRows.length < 5 ||
        middleRows.length < 4
    ){
        return;
    }

    middleRows.forEach(row => {
        row.style.height = '';
    });

    /*
        Mensen
        links kaart 2
        rechts kaart Mensen
    */

    middleRows[1].style.height =
        leftRows[1].offsetHeight + 'px';

    /*
        Incident schip
        links kaart 3
        rechts kaart Incident schip
    */

    middleRows[2].style.height =
        leftRows[2].offsetHeight + 'px';

    /*
        Algemene situatie +
        Hulpverleners
        links kaart 4 + 5
        rechts kaart Hulpverleners
    */

    const rect4 =
        leftRows[3].getBoundingClientRect();

    const rect5 =
        leftRows[4].getBoundingClientRect();

    const combinedHeight =
        rect5.bottom - rect4.top;

    middleRows[3].style.height =
        combinedHeight + 'px';
}

window.addEventListener(
    'load',
    syncPlanHeights
);

window.addEventListener(
    'resize',
    syncPlanHeights
);

new ResizeObserver(
    syncPlanHeights
).observe(
    document.getElementById('leftGrid')
);

function syncGhostRows(){

    const leftRows =
        document.querySelectorAll(
            '#leftGrid .grid-row'
        );

    const middleRows =
        document.querySelectorAll(
            '#middleGrid .grid-row'
        );

    if(leftRows.length < 5){
        return;
    }

    middleRows[0].style.height =
        leftRows[0].offsetHeight + 'px';

    middleRows[4].style.height =
        leftRows[4].offsetHeight + 'px';
}

function syncArrowRows(){

    const leftRows =
        document.querySelectorAll(
            '#leftGrid .grid-row'
        );

    const arrowRows =
        document.querySelectorAll(
            '#arrowGrid .arrow-row'
        );

    if(leftRows.length < 5){
        return;
    }

    /*
        Pijl 1 naast kaart 2
    */
    arrowRows[0].style.height =
        leftRows[0].offsetHeight + 'px';

    /*
        Pijl 2 naast kaart 3
    */
    arrowRows[1].style.height =
        leftRows[1].offsetHeight + 'px';

    /*
        Pijl 3 naast kaart 4
    */
    arrowRows[2].style.height =
        leftRows[2].offsetHeight + 'px';

    /*
        Pijl 4 naast kaart 5
    */
    arrowRows[3].style.height =
        leftRows[3].offsetHeight + 'px';

    /*
        Schuine pijl
    */
    arrowRows[4].style.height =
        leftRows[4].offsetHeight + 'px';
}


window.addEventListener(
    'load',
    syncGhostRows
);

window.addEventListener(
    'resize',
    syncGhostRows
);

new ResizeObserver(
    syncGhostRows
).observe(
    document.getElementById('leftGrid')
);

window.addEventListener(
    'load',
    syncArrowRows
);

window.addEventListener(
    'resize',
    syncArrowRows
);

new ResizeObserver(
    syncArrowRows
).observe(
    document.getElementById('leftGrid')
);

function registerFieldEvents(){

    document
        .querySelectorAll(
            '[data-field]'
        )
        .forEach(field => {

            field.addEventListener(
                'input',
                scheduleSave
            );

        });
}

renderHulpverleners();

registerFieldEvents();

loadStormData();

supabaseClient

    .channel('storm')

    .on(
        'postgres_changes',
        {
            event:'UPDATE',
            schema:'public',
            table:'storm'
        },

        () => {

            loadStormData();

        }
    )

    .subscribe();