"use client"

import { Avatar, User, Button, ButtonGroup, Chip, Tooltip } from "@heroui/react";
import IconSwitch from "../icons/IconSwitch";

export default function SideBar() {
  return (
    <div className="border-r-small border-divider relative flex h-full max-w-72 flex-1 flex-col p-6">
      <div className="flex flex-col gap-8">
        <section className="flex items-center gap-2">
          <Avatar src="../images/Kaivian Logo.png" />
          <h1 className="text-lg font-semibold">Kaivian</h1>
        </section>
        <section>
          <User
            avatarProps={{
              src: "../images/Avatar.JPG",
              isBordered: true,
            }}
            description="Software Engineer"
            name="Thế Lực"
          />
        </section>
        <section className="flex flex-col gap-1">
          <h2 className="text-tiny text-foreground-500">Overview</h2>
          <Button
            startContent={<IconSwitch name="Home" size={31} />}
            fullWidth
            size="lg"
            className="text-left px-3 bg-default/40 hover:bg-default/60 gap-2"
          >
            <p className="w-full text-small font-medium">Home</p>
          </Button>
          <Button
            startContent={<IconSwitch name="Projects" size={40} className="text-default-500" />}
            endContent={
              <Button
                as="span"
                isIconOnly
                variant="light"
                size="sm"
                radius="full"
              >
                <IconSwitch name="Plus" size={25} className="text-default-400" />
              </Button>
            }
            fullWidth
            size="lg"
            className="text-left px-3 gap-2"
            variant="light"
          >
            <p className="w-full text-small font-medium text-default-500">Projects</p>
          </Button>
          <Button
            startContent={<IconSwitch name="Tasks" size={41} className="text-default-500" />}
            endContent={
              <Button
                as="span"
                isIconOnly
                variant="light"
                size="sm"
                radius="full"
              >
                <IconSwitch name="Plus" size={25} className="text-default-400" />
              </Button>
            }
            fullWidth
            size="lg"
            className="text-left px-3 gap-2"
            variant="light"
          >
            <p className="w-full text-small font-medium text-default-500">Tasks</p>
          </Button>
          <Button
            startContent={<IconSwitch name="Group" size={28} className="text-default-500" />}
            fullWidth
            size="lg"
            className="text-left px-3"
            variant="light"
          >
            <p className="w-full text-small font-medium text-default-500">Team</p>
          </Button>
          <Button
            startContent={<IconSwitch name="Tracker" size={45} className="text-default-500" />}
            endContent={
              <Chip
                size="sm"
                radius="full"
                className="bg-default/40"
              >
                New
              </Chip>
            }
            fullWidth
            size="lg"
            className="text-left px-3 gap-2"
            variant="light"
          >
            <p className="w-full text-small font-medium text-default-500">Tracker</p>
          </Button>
        </section>
        <section>
          <h2 className="text-tiny text-foreground-500">Organization</h2>
        </section>
        <section>
          <h2 className="text-tiny text-foreground-500">Your Teams</h2>
        </section>
        <section>
        </section>
      </div>
      <footer className="mt-auto pt-4">
        <ButtonGroup fullWidth size="md">
          <Tooltip content="Help & Infomation" showArrow>
            <Button
              startContent={<IconSwitch name="Info" size={25} className="text-default-500" />}
              fullWidth
              className="text-left px-3 gap-2"
              variant="light"
            >
            </Button>
          </Tooltip>
          <Tooltip content="Settings" showArrow>
            <Button
              startContent={<IconSwitch name="Settings" size={25} className="text-default-500" />}
              fullWidth
              className="text-left px-3 gap-2"
              variant="light"
            >
            </Button>
          </Tooltip>
          <Tooltip content="Logout" showArrow>
            <Button
              startContent={<IconSwitch name="Logout" size={25} className="text-default-500" />}
              fullWidth
              className="text-left px-3 gap-2"
              variant="light"
            >
            </Button>
          </Tooltip>
        </ButtonGroup>
      </footer>
    </div>
  );
}