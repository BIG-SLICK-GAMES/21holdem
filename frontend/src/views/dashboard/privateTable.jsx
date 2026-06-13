import React, { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Form, Modal, Row, Spinner } from 'react-bootstrap';
import CustomTable from 'shared/components/Table';
import { createPrivateTable, getTables, joinPrivateTable } from 'query/gameTable.query';
import { getProfile } from 'query/profile.query';
import { getCookie, ReactToastify } from 'shared/utils';
import { useForm } from 'react-hook-form';
import { getDirtyFormValues } from 'helper/helper';

function hasPrivateTableAccess(profile = {}) {
    return Boolean(
        profile?.bIsMember ||
        profile?.isMember ||
        profile?.bMember ||
        profile?.bIsSubscribed ||
        profile?.isSubscribed ||
        profile?.bPrivateTableAccess ||
        profile?.bHasPrivateTableAccess ||
        profile?.eUserType === 'member' ||
        profile?.eUserType === 'premium' ||
        profile?.eUserType === 'vip' ||
        profile?.sUserType === 'member' ||
        profile?.sUserType === 'premium' ||
        profile?.sUserType === 'vip'
    );
}

const PrivateTable = () => {
    const navigate = useNavigate();
    const [payload, setPayload] = useState({});
    const [tablesData, setTablesData] = useState([]);
    // const [microTablesData, setMicroTablesData] = useState([]);
    // const [normalTablesData, setNormalTablesData] = useState([]);
    // const [eliteTablesData, setEliteTablesData] = useState([]);
    const [modalShow, setModalShow] = useState(false);
    const queryClient = useQueryClient();

    const { register, watch, formState: { errors, isDirty, dirtyFields }, handleSubmit } = useForm({ mode: "all" });

    const { data: profileData } = useQuery("getProfile", getProfile, {
        select: (data) => data?.data?.data || null,
        onError: (error) => {
            console.log(error);
        },
    });

    const bPrivateTablesUnlocked = hasPrivateTableAccess(profileData);
    const sPrivateCode = watch("sPrivateCode");

    const { isLoading: isDataTabelLoading } = useQuery("getTables", getTables, {
        onSuccess: (data) => {
            if (data.status === 200) {
                setTablesData([]);
                // setMicroTablesData([]);
                // setNormalTablesData([]);
                // setEliteTablesData([]);

                const tables = data.data.data;
                setTablesData(tables);
                // setMicroTablesData(tables.filter(table => table.nMinBuyIn <= 500));
                // setNormalTablesData(tables.filter(table => table.nMinBuyIn > 500 && table.nMinBuyIn <= 15000));
                // setEliteTablesData(tables.filter(table => table.nMinBuyIn > 15000 && table.nMinBuyIn <= 50000));
            }
            if (data.status === 404) {
                console.log("table not found");
            }
        },
        onError: (error) => {
            console.log(error);
        },
    });

    const { mutate: mutateCreatePrivateTable } = useMutation(createPrivateTable, {
        onSuccess: (data) => {
            if (data.status === 200) {
                console.log(data)
                navigate(`/game`, { state: { sAuthToken: getCookie('sAuthToken'), iBoardId: data.data.data.iBoardId, sPrivateCode: data.data.data.sPrivateCode } });
                // window.open(`http://192.168.11.75:5005?sAuthToken=${getCookie('sAuthToken')}&iBoardId=${data.data.data.iBoardId}`, '_blank');
            }
        },
        onError: (error) => {
            console.log(error);
            ReactToastify(error?.response?.data?.message, 'error');
            queryClient.invalidateQueries("getTables");
        },
    });

    const { mutate: mutateJoinPrivateTable } = useMutation(joinPrivateTable, {
        onSuccess: (data) => {
            if (data.status === 200) {
                navigate(`/game`, { state: { sAuthToken: getCookie('sAuthToken'), iBoardId: data.data.data.iBoardId, sPrivateCode: data.data.data.sPrivateCode } });
                // window.open(`http://192.168.11.75:5005?sAuthToken=${getCookie('sAuthToken')}&iBoardId=${data.data.data.iBoardId}`, '_blank');
            }
        },
        onError: (error) => {
            console.log(error);
            setModalShow(false);
            ReactToastify(error?.response?.data?.message, 'error');
            queryClient.invalidateQueries("getTables");
            queryClient.invalidateQueries("profileData");
        },
    });

    useEffect(() => {
        const isDirtyField = {
            sPrivateCode: sPrivateCode || "-",
        };

        const payloadData = getDirtyFormValues(dirtyFields, isDirtyField);
        setPayload(payloadData);
    }, [sPrivateCode, isDirty, dirtyFields]);

    const onSubmit = () => {
        if (!bPrivateTablesUnlocked) {
            ReactToastify('Private tables are members-only. Unlock member access before joining.', 'error');
            navigate('/lobby?tab=lobby-shop');
            return;
        }
        mutateJoinPrivateTable(payload);
    }

    return (
        <>
            <div className='dashboard-container'>
                <div className='dashboard-container__content'>
                    <div className='dashboard-container__content-table-selection'>
                        {/* <div className='dashboard-container__content-table-selection-menu'>
                            <ul>
                                <li className={activeTab === 'micro' ? 'active' : ''}>
                                    <a onClick={() => setActiveTab('micro')}>Micro Stakes</a>
                                </li>
                                <li className={activeTab === 'normal' ? 'active' : ''}>
                                    <a onClick={() => setActiveTab('normal')}>Normal Stakes</a>
                                </li>
                                <li className={activeTab === 'elite' ? 'active' : ''}>
                                    <a onClick={() => setActiveTab('elite')}>Elite Stakes</a>
                                </li>
                            </ul>
                        </div> */}
                        <div className='dashboard-container__content-table-selection-content'>
                            <div className='sub-dashboard-container__content'>
                                <div className='dashboard-container__content-table-selection-content-options private-table'>
                                    <div className='title'>Private Table</div>
                                    <div className={`private-table-access ${bPrivateTablesUnlocked ? 'is-unlocked' : 'is-locked'}`}>
                                        {bPrivateTablesUnlocked ? 'Member Access' : 'Members Only'}
                                    </div>
                                    <Button
                                        className={`join-button ${bPrivateTablesUnlocked ? '' : 'is-locked'}`}
                                        onClick={() => {
                                            if (!bPrivateTablesUnlocked) {
                                                ReactToastify('Private tables are members-only. Visit the shop to unlock access.', 'error');
                                                navigate('/lobby?tab=lobby-shop');
                                                return;
                                            }
                                            setModalShow(true);
                                        }}
                                    >
                                        {bPrivateTablesUnlocked ? 'Join Table' : 'Unlock'}
                                    </Button>
                                </div>
                                <div className='dashboard-container__content-table-selection-content-tables'>
                                    <Row className='g-2'>
                                        {!isDataTabelLoading
                                            ? <>
                                                {
                                                    tablesData.length > 0 ? tablesData.map((table, index) => (
                                                        <Col xl={4} lg={4} md={6} sm={12} xs={12} key={index} className='dashboard-table'>
                                                            <CustomTable isPrivate={true} key={table._id} tableName={table.sName} minChips={table.nMinBet} minBuyIn={table.nMinBuyIn} onPlay={() => {
                                                                if (!bPrivateTablesUnlocked) {
                                                                    ReactToastify('Private tables are members-only. Visit the shop to unlock access.', 'error');
                                                                    navigate('/lobby?tab=lobby-shop');
                                                                    return;
                                                                }
                                                                mutateCreatePrivateTable(table._id);
                                                            }} />
                                                        </Col>
                                                    )) : <Col xl={12} lg={12} md={12} sm={12} xs={12} className='no-table'>No tables found!</Col>
                                                }
                                                {/* {
                                                    activeTab === 'micro' && (
                                                        microTablesData.length > 0 ? microTablesData.map((table, index) => (
                                                            <Col xl={4} lg={4} md={6} sm={12} xs={12} key={index} className='dashboard-table'>
                                                                <CustomTable isPrivate={true} key={table._id} tableName={table.sName} minChips={table.nMinBet} entryAmount={table.nMinBuyIn} onPlay={() => mutateCreatePrivateTable(table._id)} />
                                                            </Col>
                                                        )) : <Col xl={12} lg={12} md={12} sm={12} xs={12} className='no-table'>No tables found!</Col>
                                                    )
                                                }
                                                {
                                                    activeTab === 'normal' && (
                                                        normalTablesData.length > 0 ? (
                                                            normalTablesData.map((table, index) => (
                                                                <Col xl={4} lg={4} md={6} sm={12} xs={12} key={index} className='dashboard-table'>
                                                                    <CustomTable isPrivate={true} key={table._id} tableName={table.sName} minChips={table.nMinBet} entryAmount={table.nMinBuyIn} onPlay={() => mutateCreatePrivateTable(table._id)} />
                                                                </Col>
                                                            ))
                                                        ) : <Col xl={12} lg={12} md={12} sm={12} xs={12} className='no-table'>No tables found!</Col>
                                                    )
                                                }
                                                {
                                                    activeTab === 'elite' && (
                                                        eliteTablesData.length > 0 ? eliteTablesData.map((table, index) => (
                                                            <Col xl={4} lg={4} md={6} sm={12} xs={12} key={index} className='dashboard-table'>
                                                                <CustomTable isPrivate={true} key={table._id} tableName={table.sName} minChips={table.nMinBet} entryAmount={table.nMinBuyIn} onPlay={() => mutateCreatePrivateTable(table._id)} />
                                                            </Col>
                                                        )) : <Col xl={12} lg={12} md={12} sm={12} xs={12} className='no-table'>No tables found!</Col>
                                                    )
                                                } */}
                                            </>
                                            : <Col xl={12} lg={12} md={12} sm={12} xs={12} ><Spinner variant='white mx-auto d-block' /></Col>
                                        }
                                    </Row>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >

            <Modal
                className={"join-table-modal"}
                show={modalShow}
                size="md"
                centered
            >
                <Modal.Body>
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <div className="title">JOIN TABLE</div>
                        <div className="content">
                            <Form.Group>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter Table Code"
                                    isInvalid={!!errors.sPrivateCode}
                                    maxLength={8}
                                    {...register("sPrivateCode", {
                                        required: "Table Code is required",
                                        maxLength: {
                                            value: 8,
                                            message: "Table Code must be 8 digits"
                                        },
                                        minLength: {
                                            value: 8,
                                            message: "Table Code must be 8 digits"
                                        },
                                        onChange: (e) => {
                                            e.target.value = e.target.value.replace(/[^0-9]/g, '');
                                        }
                                    })}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.sPrivateCode && errors.sPrivateCode.message}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </div>
                        <div className="button-grp">
                            <Button className='cancel' type='button' onClick={() => setModalShow(false)} >Cancel</Button>
                            <Button className='join' type='submit' disabled={!isDirty}>Join</Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

        </>
    )
}

export default PrivateTable
