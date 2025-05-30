import Layout from "../../components/common/Layout/Layout";
import DataTable from "../../components/common/DataTable/DataTable";
import styles from "../../styles/Listing.module.css";
import Button from "../../components/common/Button/Button";
import { useNavigate } from "react-router-dom";
import { CrossIcon, EditIcon, TickIcon } from "../../assets/svgs";
import { useEffect, useState } from "react";
import Fetch from "../../utils/form-handling/fetch";
import Modal from "../../components/common/Modal/Modal";
import { useToast } from "../../contexts/Toast";
import Tooltip from "../../components/common/ToolTip/ToolTip";
import { useAppContext } from "../../contexts/AppContext";

function Schools() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState<"listing" | "delete" | "">("");
  const [showModal, setShowModal] = useState("");
  const [itemToDelete, setItemToDelete] = useState("");
  const [pagination, setPagination] = useState({
    total: 0,
    currentPage: 1,
    itemsPerPage: 10,
  });

  const navigate = useNavigate();
  const toast = useToast();
  const { getSchools } = useAppContext();

  const showToast = () => {
    toast.show(
      `School ${
        showModal === "activate" ? "activated" : "deactivated"
      } successfully`,
      2000,
      "#4CAF50"
    );
  };

  const getData = (page: number) => {
    setIsLoading("listing");
    const offset = (page - 1) * pagination.itemsPerPage;
    Fetch(`schools/?limit=${pagination.itemsPerPage}&offset=${offset}`).then(
      (res: any) => {
        if (res.status) {
          setData(res.data?.results);
          setPagination((prev) => {
            return {
              ...prev,
              total: res.data?.count,
            };
          });
        }
        setIsLoading("");
      }
    );
  };

  const handleDelete = () => {
    setIsLoading("delete");
    Fetch(`schools/${itemToDelete}/`, {}, { method: "delete" }).then(
      (res: any) => {
        if (res.status) {
          if (pagination.total % pagination.itemsPerPage === 1) {
            if (pagination.currentPage === 1) {
              getData(1);
            } else {
              setPagination((prevState) => {
                return {
                  ...prevState,
                  currentPage: Math.max(prevState.currentPage - 1, 1),
                };
              });
            }
          } else {
            getData(pagination.currentPage);
          }
          showToast();
          getSchools();
        }
        setShowModal("");
        setIsLoading("listing");
      }
    );
  };

  const handleEdit = (id: string) => {
    navigate(`/schools/create/${id}`);
  };

  useEffect(() => {
    getData(pagination.currentPage);
  }, [pagination.currentPage]);

  const handleDeleteRequest = (id: string, type: string) => {
    setItemToDelete(id);
    setShowModal(type);
  };

  const columns = [
    { key: "name", header: "Name" },
    {
      key: "email",
      header: "Email",
      render: (item: any) => <a href={`mailto:${item.email}`}>{item.email}</a>,
    },

    { key: "phone", header: "Phone" },
    { key: "address", header: "Address" },
    {
      key: "is_active",
      header: "Status",
      render: (item: any) => (item.is_active ? "Active" : "Inactive"),
    },
    {
      key: "actions",
      header: "Actions",
      render: (item: any) => (
        <div>
          <Tooltip text="Edit">
            <button
              style={{ border: "none", background: "none", cursor: "pointer" }}
              onClick={() => handleEdit(item?.id)}
              className="mr-3"
            >
              <EditIcon size={20} color="#1976d2" />
            </button>
          </Tooltip>

          <Tooltip text={!item?.is_active ? "Activate" : "Deactivate"}>
            <button
              style={{
                border: "none",
                background: "none",
                cursor: "pointer",
                width: "1.8rem",
                height: "1.8rem",
              }}
              onClick={() =>
                handleDeleteRequest(
                  item?.id,
                  !item?.is_active ? "activate" : "deactivate"
                )
              }
            >
              {item?.is_active ? <CrossIcon /> : <TickIcon />}
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  const handleNavigate = () => {
    navigate("/schools/create");
  };

  const handleCancel = () => {
    setItemToDelete("");
    setShowModal("");
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => {
      return {
        ...prev,
        currentPage: page,
      };
    });
  };

  return (
    <Layout>
      <div
        style={{
          height: "calc(100vh - 10rem)",
          backgroundColor: "#f8f9fa",
          padding: "20px",
          marginTop: "20px",
        }}
      >
        <div className={styles.titleContainer}>
          <h2 className="mb-3">Schools</h2>
          <Button text="Create" onClick={handleNavigate} />
        </div>

        <DataTable
          data={data}
          columns={columns}
          itemsPerPage={pagination.itemsPerPage}
          currentPage={pagination.currentPage}
          totalRecords={pagination.total}
          onPageChange={handlePageChange}
          isLoading={isLoading === "listing"}
        />
      </div>
      <Modal
        title="Confirm!"
        message={`Are you sure you want to ${showModal} this school?`}
        onConfirm={handleDelete}
        onCancel={handleCancel}
        visible={!!showModal}
        isLoading={isLoading === "delete"}
        primaryButtonVariant="danger"
      />
    </Layout>
  );
}

export default Schools;
